import { DynamoDB } from 'aws-sdk'

const ddb = new DynamoDB.DocumentClient({
  apiVersion: '2012-08-10',
  region: process.env.AWS_REGION,
})

export const IOPutItem = async (
  table_name: string,
  item: any
): Promise<void> => {
  const put_request = {
    TableName: table_name,
    Item: item,
  }
  const response = await ddb.put(put_request).promise()
  if (response.$response.error) {
    throw new Error(`IOPutItem: ${response.$response.error}`)
  }
}
