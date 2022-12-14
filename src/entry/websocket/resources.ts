import { APIGatewayProxyHandler } from 'aws-lambda'
import { putResource } from '@lib/resource'
import {
  getAPIGatewayEventBody,
  proxyEventFailed,
  proxyEventSuccess,
} from '@utils/lambda/apigateway'

export const onPutResource: APIGatewayProxyHandler = async (event) => {
  try {
    const { data } = getAPIGatewayEventBody(event)
    await putResource(data)
  } catch (err) {
    return proxyEventFailed(err)
  }
  return proxyEventSuccess()
}
