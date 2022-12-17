import { IOgetEventSubscriptionsByResource } from '@/lib/eventSubscription'
import { IOAddReadLinkToUpload } from '@/lib/upload/readLink'
import { IOPutItem } from '@/services/ddb'
import { IONotifySubscribers } from '@/services/websocket'
import { isUpload, IUpload } from '@/models/upload'
import {
  IOCompleteMultipartUpload,
  IOCreateMultipartUpload,
  IOMakeSignedS3URL,
} from '@/services/s3'
import * as lib from '@/lib/upload/multipart'
import {
  MAX_CONCURRENT_PART_UPLOADS,
  MAX_ITERATIVE_UPDATES,
} from '@/lib/upload/constants'

export const onPutUpload = async (item: Record<any, any>) => {
  if (!isUpload(item)) {
    throw new Error('Not a valid upload')
  }
  await IOPutItem('Event', item)
}

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
    if (lib.isUploadTooBig(item)) {
      return modifyUpload(lib.changeUploadStatus(item, 'failed-max-size'))
    }

    if (!item.upload_id) {
      const uploadId = await IOCreateMultipartUpload({
        bucket: Bucket,
        key: Key,
        contentType: item.content_type,
      })
      return modifyUpload(lib.addMultipartUpload(item, uploadId))
    }

    if (!item.parts) {
      return modifyUpload(lib.addAllUploadParts(item))
    }

    let changedParts = false
    let currentUploadCount = item.parts.filter(lib.partIsUploading).length
    const partUpdates = item.parts.map(async (part) => {
      if (lib.uploadPartNeedsCleaned(part)) {
        changedParts = true
        return lib.addSignedUploadUrlToPart(part, undefined)
      }
      if (
        lib.uploadPartCanUpload(
          part,
          currentUploadCount,
          MAX_CONCURRENT_PART_UPLOADS
        )
      ) {
        currentUploadCount++
        changedParts = true
        return lib.addSignedUploadUrlToPart(
          part,
          await IOMakeSignedS3URL({
            action: 'uploadPart',
            bucket: Bucket,
            key: Key,
            expires: 900,
            upload_id: item.upload_id,
            part_number: part.part,
          })
        )
      }
      return part
    })
    if (changedParts) {
      return modifyUpload(
        lib.updateUploadParts(item, await Promise.all(partUpdates))
      )
    }

    if (lib.uploadHasAllPartsUploaded(item)) {
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
        return modifyUpload(
          await IOAddReadLinkToUpload(lib.completeUpload(item))
        )
      } catch (err) {
        return modifyUpload(lib.changeUploadStatus(item, 'failed'))
      }
    }
  }

  // We've reached a stable state update recursively, now persist changes
  if (iterations > 0) {
    return onPutUpload(item)
  }

  await IONotifySubscribers(
    [item],
    await IOgetEventSubscriptionsByResource(item.resource_id)
  )
}
