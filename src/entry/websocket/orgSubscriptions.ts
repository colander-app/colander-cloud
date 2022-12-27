import { APIGatewayProxyHandler } from 'aws-lambda'
import * as lambda from '@/utils/lambda/apigateway'
import { getExpiryInSeconds } from '@/utils/date'
import { toSeconds } from '@/utils/converter'
import * as controller from '@/controllers/orgSubscription'

const EXPIRE_ORG_SUBSCRIPTION_SECONDS = toSeconds(2, 'hr')

export const onSubscribeToOrganization: APIGatewayProxyHandler = async (
  event
) => {
  try {
    const { query } = lambda.getAPIGatewayEventBody(event)
    const requestContext = {
      connectionId: event.requestContext.connectionId,
      domainName: event.requestContext.domainName,
      stage: event.requestContext.stage,
    }
    await controller.onPutOrgSubscription(
      requestContext,
      query.organization_id,
      getExpiryInSeconds(EXPIRE_ORG_SUBSCRIPTION_SECONDS)
    )
  } catch (err) {
    return lambda.proxyEventFailed(err)
  }
  return lambda.proxyEventSuccess()
}

export const onUnsubscribeFromOrganization: APIGatewayProxyHandler = async (
  _event
) => {
  try {
    // create organization subscription, which sends updates to orgs and resources
    console.warn('TODO: NOT IMPLEMENTED')
  } catch (err) {
    return lambda.proxyEventFailed(err)
  }
  return lambda.proxyEventSuccess()
}
