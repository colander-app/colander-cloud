import { DynamoDB, S3 } from 'aws-sdk'
import { DynamoDBStreamHandler } from 'aws-lambda'
import { getItemsForResource } from '../lib/event'
import {
  getEventSubscriptionsByResource,
  getEventSubscriptionsByResourceAndRange,
} from '../lib/eventSubscription'
import { isEventSubscription } from '../models/eventSubscription'
import { isEvent } from '../models/event'
import { sendMessage } from '../lib/websocket'
import {
  isUpload,
  MAX_BYTES,
  MAX_CONCURRENT_PART_UPLOADS,
  UPLOAD_PART_SIZE,
} from '../models/upload'
import { putUpload } from '../lib/upload'

const s3 = new S3()

export const handler: DynamoDBStreamHandler = async (event) => {
  const record = event.Records[0]
  try {
    if (record.eventName === 'INSERT' || record.eventName === 'MODIFY') {
      const item: Readonly<Record<string, any>> = DynamoDB.Converter.unmarshall(
        record.dynamodb?.NewImage ?? {}
      )

      /**
       * Send items related to subscribed resources
       */
      if (isEventSubscription(item)) {
        // const initial_events = await getEventsInRange(
        //   item.subscription_resource_id,
        //   item.query.start_date,
        //   item.query.end_date
        // )
        const resource_items = await getItemsForResource(
          item.subscription_resource_id
        )
        await sendMessage(
          item.requestContext,
          item.websocket_id,
          JSON.stringify(resource_items)
        )
      } else if (isEvent(item)) {
        /**
         * Send updates to an event to all subscribers of it's resource
         */
        const subscriptions = await getEventSubscriptionsByResourceAndRange(
          item.resource_id,
          item.start_date,
          item.end_date
        )
        await Promise.allSettled(
          subscriptions.map((subscription) =>
            sendMessage(
              subscription.requestContext,
              subscription.websocket_id,
              JSON.stringify([item])
            )
          )
        )
      } else if (isUpload(item)) {
        /**
         * Handle logic to communicate with client to upload a file
         */
        const changed_item = { ...item }
        let changed = false
        const Bucket = 'colander-uploads'
        const Key = changed_item.id

        // only perform any upload logic while in the uploading status
        if (item.status === 'uploading') {
          // do a max file size check
          if (changed_item.size > MAX_BYTES) {
            changed = true
            changed_item.status = 'failed-max-size'
          } else {
            // ensure a multipart upload has been started
            if (!changed_item.upload_id) {
              changed = true
              const { UploadId } = await s3
                .createMultipartUpload({
                  Bucket,
                  Key,
                  ContentType: changed_item.content_type,
                })
                .promise()
              if (!UploadId) {
                throw new Error('Unable to create multipart upload.')
              }
              changed_item.upload_id = UploadId
            }

            // seed upload part data
            if (!changed_item.parts || changed_item.parts.length === 0) {
              changed = true
              const numOfParts = Math.ceil(changed_item.size / UPLOAD_PART_SIZE)
              changed_item.parts = [...new Array(numOfParts)].map((_, i) => ({
                uploaded: false,
                start_byte: i * UPLOAD_PART_SIZE,
                end_byte:
                  i === numOfParts - 1
                    ? changed_item.size
                    : (i + 1) * UPLOAD_PART_SIZE,
                part: i + 1,
              }))
            }

            // add in up to max number of uploadable parts at a time
            const currentUploadCount = changed_item.parts.filter(
              (p) => !p.uploaded && p.signed_upload_url
            ).length
            let remainingUploadCapacity =
              MAX_CONCURRENT_PART_UPLOADS - currentUploadCount

            // Keep a max number of concurrent uploads going and remove extra metadata for completed uploads
            changed_item.parts = await Promise.all(
              changed_item.parts.map(async (part) => {
                // remove url for completed upload (they are large)
                if (part.uploaded && part.signed_upload_url) {
                  changed = true
                  return { ...part, signed_upload_url: undefined }
                }
                // add url for pending part within max upload capacity limit
                if (
                  !part.uploaded &&
                  !part.signed_upload_url &&
                  remainingUploadCapacity > 0
                ) {
                  changed = true
                  remainingUploadCapacity -= 1
                  return {
                    ...part,
                    signed_upload_url: await s3.getSignedUrlPromise(
                      'uploadPart',
                      {
                        Bucket,
                        Key,
                        UploadId: changed_item.upload_id,
                        PartNumber: part.part,
                      }
                    ),
                  }
                }
                return part
              })
            )

            // check for upload completed
            if (
              changed_item.parts?.every((part) => part.uploaded && part.etag)
            ) {
              changed = true
              const result = await s3
                .completeMultipartUpload({
                  Bucket,
                  Key,
                  UploadId: changed_item.upload_id,
                  MultipartUpload: {
                    Parts: changed_item.parts.map((p) => ({
                      ETag: p.etag,
                      PartNumber: p.part,
                    })),
                  },
                })
                .promise()
              console.log('complete multipart upload result', result)
              changed_item.status = 'complete'
              changed_item.upload_id = undefined
              changed_item.parts = undefined
            }
          }
        }
        if (changed) {
          console.log('Upload changed', changed_item)
          await putUpload(changed_item)
        } else {
          console.log('Upload reached stable state', changed_item)
          const subscriptions = await getEventSubscriptionsByResource(
            item.resource_id
          )
          console.log('subscription sending', subscriptions)
          const sendResults = await Promise.allSettled(
            subscriptions.map((subscription) =>
              sendMessage(
                subscription.requestContext,
                subscription.websocket_id,
                JSON.stringify([item])
              )
            )
          )
          console.log('send results', sendResults)
        }
      } else {
        console.log('Unable to identify record type.', item)
      }
    }
  } catch (err) {
    console.log('Unable to process event table stream', err)
  }
}
