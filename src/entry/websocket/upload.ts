import { APIGatewayProxyHandler } from 'aws-lambda'
import * as controller from '@/controllers/upload'
import * as lambda from '@/utils/lambda/apigateway'

export const onPutUpload: APIGatewayProxyHandler = async (event) => {
  try {
    const { data } = lambda.getAPIGatewayEventBody(event)
    await controller.onPutUpload(data)
  } catch (err) {
    return lambda.proxyEventFailed(err)
  }
  return lambda.proxyEventSuccess()
}
