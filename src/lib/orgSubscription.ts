import { IOrgSubscription } from '@/models/orgSubscription'
import { DynamoDB } from 'aws-sdk'

const ddb = new DynamoDB.DocumentClient({
  apiVersion: '2012-08-10',
  region: process.env.AWS_REGION,
})

export const getItemsForOrg = async (
  organization_id: string
): Promise<Record<any, any>[]> => {
  const query = {
    TableName: 'Organization',
    IndexName: 'ItemByOrganization',
    KeyConditionExpression: 'organization_id = :o',
    ExpressionAttributeValues: {
      ':o': organization_id,
    },
  }
  const key_items = (await ddb.query(query).promise()).Items ?? []
  const key_item_ids = key_items.map(({ id }) => ({ id })) ?? []

  const items =
    (
      await ddb
        .batchGet({
          RequestItems: {
            Organization: {
              Keys: key_item_ids,
            },
          },
        })
        .promise()
    ).Responses?.['Organization'] ?? []

  return items ?? []
}

export const getOrgSubscriptionsByOrg = async (
  organization_id: string
): Promise<IOrgSubscription[]> => {
  try {
    const subscription_query = {
      TableName: 'Organization',
      IndexName: 'SubscriptionByOrganization',
      KeyConditionExpression: 'organization_id = :o',
      ExpressionAttributeValues: {
        ':o': organization_id,
      },
    }
    const subscriptionsData = await ddb.query(subscription_query).promise()
    return subscriptionsData.Items as IOrgSubscription[]
  } catch (err) {
    console.log('Failed to get connections', err.message)
    return []
  }
}
