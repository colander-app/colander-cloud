import { onPutUpload } from '@/controllers/upload'
import { IUpload } from '@/models/upload'
import { IOLogRejectedPromises } from '@/services/log'
import { IOMakeSignedS3URL } from '@/services/s3'
import { getExpiryInSeconds } from '@/utils/date'
import { EXPIRE_UPLOAD_READLINK } from './constants'

const doesUploadNeedReadLink = (upload: IUpload) => {
  if (upload.status !== 'complete') {
    return false
  }

  const hasExpiredOrNoLink =
    !upload.read_link?.url ||
    (upload.read_link && Date.now() > upload.read_link.expire_at)

  return hasExpiredOrNoLink
}

export const addReadLinkToUpload = (
  upload: IUpload,
  url: string,
  expire_in: number
): IUpload => {
  return {
    ...upload,
    read_link: {
      expire_at: getExpiryInSeconds(expire_in),
      url,
    },
  }
}

export const IOAddReadLinkToUpload = async (
  upload: IUpload,
  expire_in = EXPIRE_UPLOAD_READLINK
): Promise<IUpload> => {
  const url = await IOMakeSignedS3URL({
    action: 'getObject',
    bucket: 'colander-uploads',
    key: upload.id,
    expires: expire_in,
  })
  return addReadLinkToUpload(upload, url, expire_in)
}

export const IOUpdateExpiredUploadReadLinks = async (
  uploads: IUpload[],
  expire_in = EXPIRE_UPLOAD_READLINK
): Promise<void> => {
  const promises = uploads.map(async (upload) => {
    console.log('Upload RL check', doesUploadNeedReadLink(upload), upload)
    if (doesUploadNeedReadLink(upload)) {
      const updated_upload = await IOAddReadLinkToUpload(upload, expire_in)
      console.log('here is updated upload', updated_upload)
      await onPutUpload(updated_upload)
    }
  })
  IOLogRejectedPromises(
    'IOUpdateExpiredUploadReadLinks',
    await Promise.allSettled(promises)
  )
}
