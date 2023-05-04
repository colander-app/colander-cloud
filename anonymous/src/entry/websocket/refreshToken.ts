import { APIGatewayProxyHandler } from 'aws-lambda'
import * as lambda from '@/utils/lambda/apigateway'
import * as controller from '@/controllers/refreshToken'

export const refreshToken: APIGatewayProxyHandler = async (event, context) => {
  try {
    const { data } = lambda.getAPIGatewayEventBody(event)
    return controller.refreshToken(
      data.refresh_token,
      // @ts-expect-error - user agent should exist for websocket lambda events
      context.identity?.userAgent
    )
  } catch (err) {
    return lambda.proxyEventFailed(err)
  }
}
