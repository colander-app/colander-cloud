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

export const IOGetItemById = async (
  table_name: string,
  id: string
): Promise<unknown> => {
  const get_request = {
    TableName: table_name,
    Key: { id },
  }
  const response = await ddb.get(get_request).promise()
  if (response.$response.error) {
    throw new Error(`IOGetItemById: ${response.$response.error}`)
  }
  return response.Item
}

export const IOConditionalPut = async <T extends { id: string }>(
  table_name: string,
  item: any,
  validator: (item: any) => item is T,
  authorizer: (previous: T | undefined, next: T | undefined) => boolean
): Promise<void> => {
  if (item !== undefined && !validator(item)) {
    throw new Error('input validation failed')
  }
  const old_item = await IOGetItemById(table_name, item.id)
  if (old_item !== undefined && !validator(old_item)) {
    throw new Error('existing record by id is not of expected type')
  }
  if (authorizer(old_item, item)) {
    return IOPutItem(table_name, item)
  }
}
