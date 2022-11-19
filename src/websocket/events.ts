import { APIGatewayProxyHandler } from 'aws-lambda'
import { getEventsInRange, putEvent } from '../lib/event'
import {
  getSubscriptions,
  putSubscription,
  sendMessage,
} from '../lib/websocket'

/**
 * Event Body:
 * { query: { resource_id:string, start:string, end:string } }
 */
export const onSubscribeToEventRange: APIGatewayProxyHandler = async (
  event
) => {
  try {
    const query = JSON.parse(event.body).query

    // Create subscription in event table
    const connection_id = event.requestContext.connectionId
    await putSubscription(connection_id, query.resource_id)

    // Get initial events within range
    const initial_events = await getEventsInRange(
      query.resource_id,
      query.start_date,
      query.end_date
    )

    // Send events to client
    await sendMessage(event, connection_id, JSON.stringify(initial_events))
  } catch (err) {
    console.log('Failed to subscribe', err)
    return { statusCode: 500, body: 'Failed to subscribe.' }
  }
  return { statusCode: 200, body: 'Subscribed.' }
}

export const onPutEvent: APIGatewayProxyHandler = async (event) => {
  try {
    const data = JSON.parse(event.body).data
    const { resource_id } = data

    // create the event
    console.log('Putting event', data)
    await putEvent(data)

    // then get all websocket subscriptions for resource
    console.log('get subs:', resource_id)
    const subscriptions = await getSubscriptions(resource_id)
    console.log('subs:', subscriptions, data)
    await Promise.allSettled(
      subscriptions.map((subscription) =>
        sendMessage(event, subscription.id, JSON.stringify([data]))
      )
    )
  } catch (err) {
    const message = 'Failed to create event. ' + JSON.stringify(err)
    console.log(message, err)
    return { statusCode: 500, body: message }
  }
  return { statusCode: 200, body: 'Created event.' }
}
