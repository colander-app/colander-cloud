import { APIGatewayProxyHandler } from 'aws-lambda'
import { putProject } from '@controllers/project'
import {
  getAPIGatewayEventBody,
  proxyEventFailed,
  proxyEventSuccess,
} from '@utils/lambda/apigateway'

export const onPutProject: APIGatewayProxyHandler = async (event) => {
  try {
    const { data } = getAPIGatewayEventBody(event)
    await putProject(data)
  } catch (err) {
    return proxyEventFailed(err)
  }
  return proxyEventSuccess()
}
