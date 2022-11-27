import { DynamoDB } from 'aws-sdk'
import { isProject } from '../models/project'

const ddb = new DynamoDB.DocumentClient({
  apiVersion: '2012-08-10',
  region: process.env.AWS_REGION,
})

export const putProject = async (item: unknown): Promise<void> => {
  if (!isProject(item)) {
    throw new Error('Not a valid project')
  }
  const put_request = { TableName: 'Event', Item: item }
  await ddb.put(put_request).promise()
}
