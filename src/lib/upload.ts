import { DynamoDB } from 'aws-sdk'
import { EXPIRE_UPLOAD_SECONDS, isUpload } from '../models/upload'
import { getExpiryInSeconds } from '../utils/date'

const ddb = new DynamoDB.DocumentClient({
  apiVersion: '2012-08-10',
  region: process.env.AWS_REGION,
})

export const putUpload = async (item: Record<any, any>) => {
  const maybeUpload = {
    ...item,
    expire_at: getExpiryInSeconds(EXPIRE_UPLOAD_SECONDS),
  }
  if (!isUpload(maybeUpload)) {
    throw new Error('Not a valid upload')
  }
  const put_request = { TableName: 'Event', Item: maybeUpload }
  await ddb.put(put_request).promise()
}
