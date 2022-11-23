import { DynamoDB } from 'aws-sdk'
import {
  IEventSubscription,
  isEventSubscription,
} from '../models/eventSubscription'

const ddb = new DynamoDB.DocumentClient({
  apiVersion: '2012-08-10',
  region: process.env.AWS_REGION,
})

/**
 * Remove websocket event subscription for a resource
 */
export const removeEventSubscription = async (
  connection_id: string,
  resource_id: string
) => {
  // const query_subscriptions = {
  //   TableName: 'Event',
  // }
  // const events = (await ddb.query(query_subscriptions).promise()).Items
  // const delete_requests = events?.map(({ id }) => ({
  //   DeleteRequest: { Key: { id } },
  // }))
  // return ddb.batchWrite({
  //   RequestItems: {
  //     Event: [
  //       {
  //         DeleteRequest: {
  //           Key: {
  //             id,
  //           },
  //         },
  //       },
  //     ],
  //   },
  // })
}

/**
 * Query event subscriptions by resource id
 */
export const getEventSubscriptionsByResource = async (
  resource_id: string,
  start_date: string,
  end_date: string
): Promise<IEventSubscription[]> => {
  try {
    const subscription_query = {
      TableName: 'Event',
      IndexName: 'WsSubscriptionByResource',
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
 * Validate and add an eventSubscription into the Event Table
 */
export const putEventSubscription = async (
  requestContext: {
    connectionId?: string
    domainName?: string
    stage?: string
  },
  query: {
    resource_id: string
    start_date: string
    end_date: string
  }
): Promise<void> => {
  const subscription = {
    id: `${requestContext.connectionId}_${query.resource_id}`,
    websocket_id: requestContext.connectionId,
    requestContext,
    subscription_resource_id: query.resource_id,
    query: {
      start_date: query.start_date,
      end_date: query.end_date,
    },
  }
  if (!isEventSubscription(subscription)) {
    throw new Error('Invalid subscription format')
  }
  const put_request = {
    TableName: 'Event',
    Item: subscription,
  }
  await ddb.put(put_request).promise()
}
