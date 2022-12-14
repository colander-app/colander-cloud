import { DynamoDB } from 'aws-sdk'
import { DynamoDBStreamHandler } from 'aws-lambda'
import { getItemsForResource } from '@lib/event'
import { getEventSubscriptionsByResourceAndRange } from '@lib/eventSubscription'
import { isEventSubscription } from '@models/eventSubscription'
import { isEvent } from '@models/event'
import { IOSendMessageWS } from '@services/websocket'
import { isUpload } from '@models/upload'
import { onUploadChanged } from '@controllers/upload'
import { IOUpdateExpiredUploadReadLinks } from '@lib/upload/readLink'

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
        const resource_items = await getItemsForResource(
          item.subscription_resource_id
        )
        await IOUpdateExpiredUploadReadLinks(resource_items.filter(isUpload))
        await IOSendMessageWS(
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
            IOSendMessageWS(
              subscription.requestContext,
              subscription.websocket_id,
              JSON.stringify([item])
            )
          )
        )
      } else if (isUpload(item)) {
        await onUploadChanged(item)
      } else {
        console.log('Unable to identify record type.', item)
      }
    }
  } catch (err) {
    console.log('Unable to process event table stream', err)
  }
}
