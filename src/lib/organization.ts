import { DynamoDB } from 'aws-sdk'
import { isOrganization } from '../models/organization'

const ddb = new DynamoDB.DocumentClient({
  apiVersion: '2012-08-10',
  region: process.env.AWS_REGION,
})

export const putOrganization = async (item: unknown): Promise<void> => {
  if (!isOrganization(item)) {
    throw new Error('Not a valid organization')
  }
  const put_request = { TableName: 'Organization', Item: item }
  await ddb.put(put_request).promise()
}
