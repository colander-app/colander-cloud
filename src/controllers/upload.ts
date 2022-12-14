import { getEventSubscriptionsByResource } from '@lib/eventSubscription'
import { IOAddReadLinkToUpload } from '@lib/upload/readLink'
import { IOPutItem } from '@services/ddb'
import { IOSendMessageWS } from '@services/websocket'
import {
  isUpload,
  IUpload,
  MAX_BYTES,
  MAX_CONCURRENT_PART_UPLOADS,
  UploadPart,
  UPLOAD_PART_SIZE,
} from '@models/upload'
import {
  IOCompleteMultipartUpload,
  IOCreateMultipartUpload,
  IOMakeSignedS3URL,
} from '@services/s3'
import { IOLogRejectedPromises } from '@services/log'

// Ensure we don't create an infinite loop updating upload state
const MAX_ITERATIVE_UPDATES = 50

export const onPutUpload = async (item: Record<any, any>) => {
  if (!isUpload(item)) {
    throw new Error('Not a valid upload')
  }
  await IOPutItem('Event', item)
}

export const isUploadTooBig = (upload: IUpload) => upload.size > MAX_BYTES

export const uploadPartNeedsCleaned = (part: UploadPart) =>
  Boolean(part.uploaded && part.signed_upload_url)

export const partIsUploading = (part: UploadPart) =>
  Boolean(!part.uploaded && part.signed_upload_url)

export const uploadPartCanUpload = (
  part: UploadPart,
  concurrentUploads: number,
  maxConcurrent: number
) =>
  Boolean(
    !part.uploaded &&
      !part.signed_upload_url &&
      concurrentUploads < maxConcurrent
  )

export const uploadHasAllPartsUploaded = (upload: IUpload) =>
  upload.parts?.every((part) => part.uploaded && part.etag)

export const changeUploadStatus = (
  upload: IUpload,
  status: IUpload['status']
): IUpload => ({
  ...upload,
  status,
})

export const addMultipartUpload = (
  upload: IUpload,
  upload_id: string
): IUpload => ({ ...upload, upload_id })

export const addAllUploadParts = (upload: IUpload): IUpload => {
  const numOfParts = Math.ceil(upload.size / UPLOAD_PART_SIZE)
  return {
    ...upload,
    parts: [...new Array(numOfParts)].map((_, i) => ({
      uploaded: false,
      start_byte: i * UPLOAD_PART_SIZE,
      end_byte: i === numOfParts - 1 ? upload.size : (i + 1) * UPLOAD_PART_SIZE,
      part: i + 1,
    })),
  }
}

export const addSignedUploadUrlToPart = (
  part: UploadPart,
  signed_upload_url?: string
): UploadPart => ({
  ...part,
  signed_upload_url,
})

export const updateUploadParts = (
  upload: IUpload,
  parts: UploadPart[]
): IUpload => ({
  ...upload,
  parts,
})

export const completeUpload = (upload: IUpload): IUpload => ({
  ...changeUploadStatus(upload, 'complete'),
  parts: undefined,
  upload_id: undefined,
})

/**
 * This controller primarily deals with communicating multipart file uploads
 */
export const onUploadChanged = async (
  item: IUpload,
  iterations = 0
): Promise<void> => {
  const Bucket = 'colander-uploads'
  const Key = item.id

  const modifyUpload = (_upload: IUpload) => {
    if (iterations < MAX_ITERATIVE_UPDATES) {
      return onUploadChanged(_upload, iterations + 1)
    }
    throw new Error(
      `onUploadChanged: Max recursive iterations exceeded in upload state machine.`
    )
  }

  // only perform any iterative upload logic while in the uploading status
  if (item.status === 'uploading') {
    if (isUploadTooBig(item)) {
      return modifyUpload(changeUploadStatus(item, 'failed-max-size'))
    }

    if (!item.upload_id) {
      const uploadId = await IOCreateMultipartUpload({
        bucket: Bucket,
        key: Key,
        contentType: item.content_type,
      })
      return modifyUpload(addMultipartUpload(item, uploadId))
    }

    if (!item.parts) {
      return modifyUpload(addAllUploadParts(item))
    }

    let changedParts = false
    let currentUploadCount = item.parts.filter(partIsUploading).length
    const partUpdates = item.parts.map(async (part) => {
      if (uploadPartNeedsCleaned(part)) {
        changedParts = true
        return addSignedUploadUrlToPart(part, undefined)
      }
      if (
        uploadPartCanUpload(
          part,
          currentUploadCount,
          MAX_CONCURRENT_PART_UPLOADS
        )
      ) {
        currentUploadCount++
        changedParts = true
        return addSignedUploadUrlToPart(
          part,
          await IOMakeSignedS3URL({
            action: 'uploadPart',
            bucket: Bucket,
            key: Key,
            expires: 900,
            upload_id: item.upload_id,
            part_number: part.part,
          }).catch(() => undefined)
        )
      }
      return part
    })
    if (changedParts) {
      return modifyUpload(
        updateUploadParts(item, await Promise.all(partUpdates))
      )
    }

    if (uploadHasAllPartsUploaded(item)) {
      try {
        await IOCompleteMultipartUpload({
          bucket: Bucket,
          key: Key,
          uploadId: item.upload_id,
          parts: item.parts.map((p) => ({
            ETag: p.etag as string, // type validated in condition above
            PartNumber: p.part,
          })),
        })
        return modifyUpload(await IOAddReadLinkToUpload(completeUpload(item)))
      } catch (err) {
        return modifyUpload(changeUploadStatus(item, 'failed'))
      }
    }
  }

  // We've reached a stable state update recursively, now persist changes
  if (iterations > 0) {
    return onPutUpload(item)
  }

  const subscriptions = await getEventSubscriptionsByResource(item.resource_id)
  const sendResults = await Promise.allSettled(
    subscriptions.map((subscription) =>
      IOSendMessageWS(
        subscription.requestContext,
        subscription.websocket_id,
        JSON.stringify([item])
      )
    )
  )
  IOLogRejectedPromises('onUploadChanged', sendResults)
}
