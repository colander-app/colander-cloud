import { DynamoDB } from 'aws-sdk'
import { APIGatewayProxyHandler } from 'aws-lambda'
import { sendMessage } from '../lib/websocket'
import { listEvents } from '../lib/event'

const ddb = new DynamoDB.DocumentClient({
  apiVersion: '2012-08-10',
  region: process.env.AWS_REGION,
})

export const connect: APIGatewayProxyHandler = async (event) => {
  const putParams = {
    TableName: 'Websocket',
    Item: { id: event.requestContext.connectionId },
  }
  try {
    await ddb.put(putParams).promise()
  } catch (err) {
    const message = 'Failed to connect. ' + JSON.stringify(err)
    console.log(message, err)
    return {
      statusCode: 500,
      body: message,
    }
  }
  return { statusCode: 200, body: 'Connected.' }
}

export const onSubscribe: APIGatewayProxyHandler = async (event) => {
  try {
    const items = await listEvents()
    await sendMessage(
      event,
      event.requestContext.connectionId,
      JSON.stringify(items)
    )
    // TODO: Handle sendMessage failure, delete ddb item for connection if doesn't exist
  } catch (err) {
    const message = 'Failed to subscribe. ' + JSON.stringify(err)
    console.log(message, err)
    return { statusCode: 500, body: message }
  }
  return { statusCode: 200, body: 'Subscribed.' }
}

export const onMessage: APIGatewayProxyHandler = async (event, context) => {
  console.log('Received message on default handler', event, context)
  return { statusCode: 200, body: 'ok' }
}

export const disconnect: APIGatewayProxyHandler = async (event) => {
  const deleteParams = {
    TableName: 'Websocket',
    Key: {
      id: event.requestContext.connectionId,
    },
  }
  console.log('Removing connection', event.requestContext.connectionId)
  try {
    await ddb.delete(deleteParams).promise()
  } catch (err) {
    const message = 'Failed to disconnect. ' + JSON.stringify(err)
    console.log(message, err)
    return { statusCode: 500, body: message }
  }
  return { statusCode: 200, body: 'Disconnected.' }
}
