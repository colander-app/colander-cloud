import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

export const getAPIGatewayEventBody = (
  event: APIGatewayProxyEvent
): Record<string, any> => {
  try {
    return JSON.parse(event.body ?? '{}')
  } catch (err) {
    return {}
  }
}

export const proxyEventSuccess = (
  body = 'Success',
  statusCode = 200
): APIGatewayProxyResult => {
  return { statusCode, body }
}

export const proxyEventFailed = (
  error: any,
  statusCode = 500
): APIGatewayProxyResult => {
  const body =
    typeof error === 'string'
      ? error
      : error?.message ?? error ?? 'Unknown failure'
  console.log('Failed with message', body)
  console.error(error)
  return { statusCode, body }
}
