import { DynamoDB } from 'aws-sdk'
import { IEventSubscription } from '@/models/eventSubscription'

const ddb = new DynamoDB.DocumentClient({
  apiVersion: '2012-08-10',
  region: process.env.AWS_REGION,
})

export const removeEventSubscriptionByResource = async (
  connection_id: string,
  resource_id: string
) => {
  const query_subscriptions = {
    TableName: 'Event',
    IndexName: 'SubscriptionByResource',
    KeyConditionExpression:
      'subscription_resource_id = :rid AND websocket_id = :wsid',
    ExpressionAttributeValues: {
      ':rid': resource_id,
      ':wsid': connection_id,
    },
  }
  const subscriptions = (await ddb.query(query_subscriptions).promise()).Items
  const delete_requests = subscriptions?.map(({ id }) => ({
    DeleteRequest: { Key: { id } },
  }))
  if (delete_requests) {
    await ddb.batchWrite({
      RequestItems: {
        Event: delete_requests,
      },
    })
    console.log('deleted', delete_requests.length, 'items')
  } else {
    console.log('no items deleted')
  }
}

export const removeEventSubscriptionsByConnection = async (
  connection_id: string
) => {
  const query_subscriptions = {
    TableName: 'Event',
    IndexName: 'WsSubscriptionById',
    KeyConditionExpression: 'websocket_id = :id',
    ExpressionAttributeValues: {
      ':id': connection_id,
    },
  }
  const subscriptions = (await ddb.query(query_subscriptions).promise()).Items
  const delete_requests = subscriptions?.map(({ id }) => ({
    DeleteRequest: { Key: { id } },
  }))
  if (delete_requests) {
    await ddb.batchWrite({
      RequestItems: {
        Event: delete_requests,
      },
    })
    console.log('deleted', delete_requests.length, 'items')
  } else {
    console.log('no items deleted')
  }
}

/**
 * Query event subscriptions by resource id and range
 */
export const getEventSubscriptionsByResourceAndRange = async (
  resource_id: string,
  start_date: string,
  end_date: string
): Promise<IEventSubscription[]> => {
  try {
    const subscription_query = {
      TableName: 'Event',
      IndexName: 'SubscriptionByResource',
      KeyConditionExpression: '#subscription_resource_id = :r',
      FilterExpression: '#query.#start <= :e AND #query.#end >= :s',
      ExpressionAttributeNames: {
        '#subscription_resource_id': 'subscription_resource_id',
        '#query': 'query',
        '#start': 'start_date',
        '#end': 'end_date',
      },
      ExpressionAttributeValues: {
        ':r': resource_id,
        ':s': start_date,
        ':e': end_date,
      },
    }
    const subscriptionsData = await ddb.query(subscription_query).promise()
    return subscriptionsData.Items as IEventSubscription[]
  } catch (err) {
    console.log('Failed to get connections', err.message)
    return []
  }
}

/**
 * Query event subscriptions by resource id
 */
export const IOgetEventSubscriptionsByResource = async (
  resource_id: string
): Promise<IEventSubscription[]> => {
  try {
    const subscription_query = {
      TableName: 'Event',
      IndexName: 'SubscriptionByResource',
      KeyConditionExpression: '#subscription_resource_id = :r',
      ExpressionAttributeNames: {
        '#subscription_resource_id': 'subscription_resource_id',
      },
      ExpressionAttributeValues: {
        ':r': resource_id,
      },
    }
    const subscriptionsData = await ddb.query(subscription_query).promise()
    return subscriptionsData.Items as IEventSubscription[]
  } catch (err) {
    console.log('Failed to get connections', err.message)
    return []
  }
}
