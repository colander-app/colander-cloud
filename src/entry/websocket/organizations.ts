import { APIGatewayProxyHandler } from 'aws-lambda'
import * as controller from '@/controllers/organization'
import {
  getAPIGatewayEventBody,
  proxyEventFailed,
  proxyEventSuccess,
} from '@/utils/lambda/apigateway'

export const onPutOrganization: APIGatewayProxyHandler = async (event) => {
  try {
    const { data } = getAPIGatewayEventBody(event)
    await controller.onPutOrganization(data)
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
