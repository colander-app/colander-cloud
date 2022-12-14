import { S3 } from 'aws-sdk'

const s3 = new S3()

type S3Action = 'getObject' | 'uploadPart'
interface MakeSignedS3UrlDeps {
  action: S3Action
  bucket: string
  key: string
  expires: number
  upload_id?: string
  part_number?: number
}
export const IOMakeSignedS3URL = async ({
  action,
  bucket,
  key,
  expires,
}: MakeSignedS3UrlDeps): Promise<string> => {
  const url = await s3.getSignedUrlPromise(action, {
    Bucket: bucket,
    Key: key,
    Expires: expires,
  })

  if (!url) {
    throw new Error('IOMakeSignedS3URL: unknown service error')
  }

  return url
}

interface CreateMultipartUploadDeps {
  bucket: string
  key: string
  contentType: string
}
export const IOCreateMultipartUpload = async ({
  bucket,
  key,
  contentType,
}: CreateMultipartUploadDeps): Promise<string> => {
  const response = await s3
    .createMultipartUpload({
      Bucket: bucket,
      Key: key,
      ContentType: contentType,
    })
    .promise()

  if (response.$response.error || !response.UploadId) {
    throw new Error(
      `IOCreateMultipartUpload: ${
        response.$response.error?.message ?? 'unknown service error.'
      }`
    )
  }

  return response.UploadId
}

interface CompleteMultipartUploadDeps {
  bucket: string
  key: string
  uploadId: string
  parts: Array<{ ETag: string; PartNumber: number }>
}
export const IOCompleteMultipartUpload = async ({
  bucket,
  key,
  uploadId,
  parts,
}: CompleteMultipartUploadDeps) => {
  const response = await s3
    .completeMultipartUpload({
      Bucket: bucket,
      Key: key,
      UploadId: uploadId,
      MultipartUpload: {
        Parts: parts,
      },
    })
    .promise()

  if (response.$response.error) {
    throw new Error(`IOCompleteMultipartUpload: ${response.$response.error}`)
  }
}
