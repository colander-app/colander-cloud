import { DynamoDB } from 'aws-sdk'
import { isResource } from '../models/resource'

const ddb = new DynamoDB.DocumentClient({
  apiVersion: '2012-08-10',
  region: process.env.AWS_REGION,
})

export const putResource = async (item: unknown): Promise<void> => {
  if (!isResource(item)) {
    throw new Error('Not a valid resource')
  }
  const put_request = { TableName: 'Organization', Item: item }
  await ddb.put(put_request).promise()
}
