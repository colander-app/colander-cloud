import { APIGatewayProxyHandler } from 'aws-lambda'
import * as lambda from '@/utils/lambda/apigateway'
import * as controller from '@/controllers/magic'

export const initMagicLogin: APIGatewayProxyHandler = async (event) => {
  try {
    const { data } = lambda.getAPIGatewayEventBody(event)
    await controller.initMagicLogin(data.email)
    return lambda.proxyEventSuccess()
  } catch (err) {
    return lambda.proxyEventFailed(err)
  }
}

export const completeMagicLogin: APIGatewayProxyHandler = async (
  event,
  context
) => {
  try {
    const { data } = lambda.getAPIGatewayEventBody(event)
    return controller.completeMagicLogin(
      data.email,
      data.code,
      // @ts-expect-error - user agent should exist for websocket lambda events
      context.identity?.userAgent
    )
  } catch (err) {
    return lambda.proxyEventFailed(err)
  }
}
