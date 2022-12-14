import { APIGatewayProxyHandler } from 'aws-lambda'
import * as controller from '@controllers/upload'
import {
  getAPIGatewayEventBody,
  proxyEventFailed,
  proxyEventSuccess,
} from '@utils/lambda/apigateway'

export const onPutUpload: APIGatewayProxyHandler = async (event) => {
  try {
    const { data } = getAPIGatewayEventBody(event)
    await controller.onPutUpload(data)
  } catch (err) {
    return proxyEventFailed(err)
  }
  return proxyEventSuccess()
}
