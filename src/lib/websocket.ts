import { APIGatewayProxyEvent } from 'aws-lambda'
import { ApiGatewayManagementApi, DynamoDB } from 'aws-sdk'

export const enum ErrorResponses {
  NonExistent = 'NonExistent',
  Failed = 'Failed',
}

const ddb = new DynamoDB.DocumentClient({
  apiVersion: '2012-08-10',
  region: process.env.AWS_REGION,
})

export const getSubscriptions = async (resource_id: string) => {
  try {
    const subscription_query = {
      TableName: 'Event',
      IndexName: 'SubscriptionResourceIndex',
      KeyConditionExpression: 'subscription_resource_id = :r',
      ExpressionAttributeValues: {
        ':r': resource_id,
      },
    }
    const subscriptionsData = await ddb.query(subscription_query).promise()
    return subscriptionsData.Items
  } catch (err) {
    console.log('Failed to get connections', err.message)
    return []
  }
}

export const putSubscription = async (
  websocket_id: string,
  subscription_resource_id: string
) => {
  try {
    const put_request = {
      TableName: 'Event',
      Item: {
        id: `${websocket_id}_${subscription_resource_id}`,
        websocket_id,
        subscription_resource_id,
      },
    }
    await ddb.put(put_request).promise()
  } catch (err) {
    console.log('Failed to create subscription', err)
  }
}

export const sendMessage = async (
  event: APIGatewayProxyEvent,
  connectionId: string,
  message: string
): Promise<ErrorResponses | null> => {
  const apigwMgmtApi = new ApiGatewayManagementApi({
    apiVersion: '2018-11-29',
    endpoint:
      event.requestContext.domainName + '/' + event.requestContext.stage,
  })
  try {
    await apigwMgmtApi
      .postToConnection({
        ConnectionId: connectionId,
        Data: message,
      })
      .promise()
  } catch (err) {
    console.log('Failed to send message', err.message)
    if (err.statusCode === 410) {
      return ErrorResponses.NonExistent
    }
    return ErrorResponses.Failed
  }
  return null
}
