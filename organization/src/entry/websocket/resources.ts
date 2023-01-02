import { APIGatewayProxyHandler } from 'aws-lambda'
import * as controller from '@/controllers/resource'
import * as lambda from '@/utils/lambda/apigateway'

export const onPutResource: APIGatewayProxyHandler = async (event) => {
  try {
    const { data } = lambda.getAPIGatewayEventBody(event)
    await controller.onPutResource(data)
  } catch (err) {
    return lambda.proxyEventFailed(err)
  }
  return lambda.proxyEventSuccess()
}
