import { IUpload, UploadPart } from '@/models/upload'
import { MAX_BYTES, UPLOAD_PART_SIZE } from './constants'

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
