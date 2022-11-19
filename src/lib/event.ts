import { DynamoDB } from 'aws-sdk'

const ddb = new DynamoDB.DocumentClient({
  apiVersion: '2012-08-10',
  region: process.env.AWS_REGION,
})

export const putEvent = async (item) => {
  try {
    console.log('Creating event', item)
    await ddb.put({ TableName: 'Event', Item: item }).promise()
  } catch (err) {
    console.log('Failed to create event', err)
  }
}

export const getEventsInRange = async (
  resource_id: string,
  start_date: string,
  end_date: string
) => {
  const query_left = {
    TableName: 'Event',
    IndexName: 'ResourceStartIndex',
    KeyConditionExpression: 'resource_id = :r AND start_date <= :e',
    ExpressionAttributeValues: {
      ':r': resource_id,
      ':e': end_date,
    },
  }

  const query_right = {
    TableName: 'Event',
    IndexName: 'ResourceEndIndex',
    KeyConditionExpression: 'resource_id = :r AND end_date >= :s',
    ExpressionAttributeValues: {
      ':r': resource_id,
      ':s': start_date,
    },
  }

  const results_left = await ddb.query(query_left).promise()
  const results_right = await ddb.query(query_right).promise()
  const merged_results = [...results_left.Items, ...results_right.Items]
  return merged_results
}

export const listEvents = async () => {
  try {
    const itemData = await ddb.scan({ TableName: 'Event' }).promise()
    return itemData.Items
  } catch (err) {
    console.log('Failed to list events', err)
    return []
  }
}
