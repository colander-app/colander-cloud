import { APIGatewayProxyHandler } from 'aws-lambda'
import { putUpload } from '../lib/upload'
import {
  getAPIGatewayEventBody,
  proxyEventFailed,
  proxyEventSuccess,
} from '../utils/lambda/apigateway'

export const onPutUpload: APIGatewayProxyHandler = async (event) => {
  try {
    const { data } = getAPIGatewayEventBody(event)
    await putUpload(data)
  } catch (err) {
    return proxyEventFailed(err)
  }
  return proxyEventSuccess()
}
