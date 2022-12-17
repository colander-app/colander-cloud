import { APIGatewayProxyHandler } from 'aws-lambda'
import {
  putEventSubscription,
  removeEventSubscriptionByResource,
} from '@/lib/eventSubscription'
import { toSeconds } from '@/utils/converter'
import { getExpiryInSeconds } from '@/utils/date'
import * as controller from '@/controllers/event'
import * as lambda from '@/utils/lambda/apigateway'

const EXPIRE_SUBSCRIPTION_SECONDS = toSeconds(2, 'hr')

export const onPutEvent: APIGatewayProxyHandler = async (event) => {
  try {
    const { data } = lambda.getAPIGatewayEventBody(event)
    await controller.onPutEvent(data)
  } catch (err) {
    return lambda.proxyEventFailed(err)
  }
  return lambda.proxyEventSuccess()
}

export const onSubscribeToEventRange: APIGatewayProxyHandler = async (
  event
) => {
  try {
    const { query } = lambda.getAPIGatewayEventBody(event)
    const requestContext = {
      connectionId: event.requestContext.connectionId,
      domainName: event.requestContext.domainName,
      stage: event.requestContext.stage,
    }
    const { resource_ids, ...restOfQuery } = query
    const requests = resource_ids.map((resource_id) =>
      putEventSubscription(
        requestContext,
        { resource_id, ...restOfQuery },
        getExpiryInSeconds(EXPIRE_SUBSCRIPTION_SECONDS)
      )
    )
    console.log(await Promise.allSettled(requests))
  } catch (err) {
    return lambda.proxyEventFailed(err)
  }
  return lambda.proxyEventSuccess()
}

export const onUnsubscribeFromEventRange: APIGatewayProxyHandler = async (
  event
) => {
  try {
    const { data } = lambda.getAPIGatewayEventBody(event)
    const { connectionId } = event.requestContext
    const requests = data.resource_ids.map((id) =>
      removeEventSubscriptionByResource(connectionId!, id)
    )
    await Promise.allSettled(requests)
  } catch (err) {
    return lambda.proxyEventFailed(err)
  }
  return lambda.proxyEventSuccess()
}
