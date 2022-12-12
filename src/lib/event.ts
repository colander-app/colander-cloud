import { DynamoDB } from 'aws-sdk'
import { IEvent, isEvent } from '../models/event'

const ddb = new DynamoDB.DocumentClient({
  apiVersion: '2012-08-10',
  region: process.env.AWS_REGION,
})

export const putEvent = async (item: unknown): Promise<void> => {
  if (!isEvent(item)) {
    throw new Error('Not a valid event')
  }
  const put_request = { TableName: 'Event', Item: item }
  await ddb.put(put_request).promise()
}

export const getItemsForResource = async (
  resource_id: string
): Promise<unknown[]> => {
  const query = {
    TableName: 'Event',
    IndexName: 'ItemByResource',
    KeyConditionExpression: 'resource_id = :r',
    ExpressionAttributeValues: {
      ':r': resource_id,
    },
  }
  const key_items = (await ddb.query(query).promise()).Items ?? []
  const key_item_ids = key_items.map(({ id }) => ({ id })) ?? []

  const items =
    (
      await ddb
        .batchGet({
          RequestItems: {
            Event: {
              Keys: key_item_ids,
            },
          },
        })
        .promise()
    ).Responses?.['Event'] ?? []

  return items ?? []
}

/**
 * Query events by both the EventByResourceStartDate and EventByResourceEndDate indexes
 * return the merged unique results
 */
export const getEventsInRange = async (
  resource_id: string,
  start_date: string,
  end_date: string
): Promise<IEvent[]> => {
  // Query events matching start date index
  const query_left = {
    TableName: 'Event',
    IndexName: 'EventByResourceStartDate',
    KeyConditionExpression: 'resource_id = :r AND start_date <= :e',
    ExpressionAttributeValues: {
      ':r': resource_id,
      ':e': end_date,
    },
  }

  // Query events matching end date index
  const query_right = {
    TableName: 'Event',
    IndexName: 'EventByResourceEndDate',
    KeyConditionExpression: 'resource_id = :r AND end_date >= :s',
    ExpressionAttributeValues: {
      ':r': resource_id,
      ':s': start_date,
    },
  }

  // Execute queries
  const results_left = (await ddb.query(query_left).promise()).Items ?? []
  const results_right = (await ddb.query(query_right).promise()).Items ?? []

  // Get unique event ids
  const event_ids = [...results_left, ...results_right]
    .map((r) => r.id)
    .filter((id, i, arr) => arr.indexOf(id) === i)

  // Get all event details
  const events =
    (
      await ddb
        .batchGet({
          RequestItems: {
            Event: {
              Keys: event_ids.map((id) => ({ id })),
            },
          },
        })
        .promise()
    ).Responses?.['Event'] ?? []

  return events as IEvent[]
}
