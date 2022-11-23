import { APIGatewayProxyHandler } from 'aws-lambda'
import { putEvent } from '../lib/event'
import {
  putEventSubscription,
  removeEventSubscription,
} from '../lib/subscription'
import {
  getAPIGatewayEventBody,
  proxyEventFailed,
  proxyEventSuccess,
} from '../utils/lambda/apigateway'

/**
 * Subscribe to events by resource on a given time window
 */
export const onSubscribeToEventRange: APIGatewayProxyHandler = async (
  event
) => {
  try {
    const { query } = getAPIGatewayEventBody(event)
    const requestContext = {
      connectionId: event.requestContext.connectionId,
      domainName: event.requestContext.domainName,
      stage: event.requestContext.stage,
    }
    await putEventSubscription(requestContext, query)
  } catch (err) {
    return proxyEventFailed(err)
  }
  return proxyEventSuccess()
}

/**
 * Unsubscribe a websocket from a resource
 */
export const onUnsubscribeFromEventRange: APIGatewayProxyHandler = async (
  event
) => {
  try {
    const { data } = getAPIGatewayEventBody(event)
    const { connectionId } = event.requestContext
    await removeEventSubscription(connectionId!, data.resource_id)
  } catch (err) {
    return proxyEventFailed(err)
  }
  return proxyEventSuccess()
}

export const onPutEvent: APIGatewayProxyHandler = async (event) => {
  try {
    const { data } = getAPIGatewayEventBody(event)
    await putEvent(data)
  } catch (err) {
    return proxyEventFailed(err)
  }
  return proxyEventSuccess()
}
