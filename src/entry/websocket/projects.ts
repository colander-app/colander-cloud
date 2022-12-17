import { APIGatewayProxyHandler } from 'aws-lambda'
import * as controller from '@/controllers/project'
import * as lambda from '@/utils/lambda/apigateway'

export const onPutProject: APIGatewayProxyHandler = async (event) => {
  try {
    const { data } = lambda.getAPIGatewayEventBody(event)
    await controller.onPutProject(data)
  } catch (err) {
    return lambda.proxyEventFailed(err)
  }
  return lambda.proxyEventSuccess()
}
