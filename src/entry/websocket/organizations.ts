import { APIGatewayProxyHandler } from 'aws-lambda'
import { putOrganization } from '@lib/organization'
import {
  getAPIGatewayEventBody,
  proxyEventFailed,
  proxyEventSuccess,
} from '@utils/lambda/apigateway'

export const onPutOrganization: APIGatewayProxyHandler = async (event) => {
  try {
    const { data } = getAPIGatewayEventBody(event)
    await putOrganization(data)
  } catch (err) {
    return proxyEventFailed(err)
  }
  return proxyEventSuccess()
}

export const onSubscribeToOrganization: APIGatewayProxyHandler = async (
  event
) => {
  try {
    // create organization subscription, which sends updates to orgs and resources
  } catch (err) {
    return proxyEventFailed(err)
  }
  return proxyEventSuccess()
}

export const onUnsubscribeFromOrganization: APIGatewayProxyHandler = async (
  event
) => {
  try {
    // create organization subscription, which sends updates to orgs and resources
  } catch (err) {
    return proxyEventFailed(err)
  }
  return proxyEventSuccess()
}
