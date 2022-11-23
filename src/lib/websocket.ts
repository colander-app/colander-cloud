import { APIGatewayProxyEvent } from 'aws-lambda'
import { ApiGatewayManagementApi } from 'aws-sdk'

export const enum ErrorResponses {
  NonExistent = 'NonExistent',
  Failed = 'Failed',
}

/**
 * Send a JSON message to a websocket client
 */
export const sendMessage = async (
  requestContext: Pick<
    APIGatewayProxyEvent['requestContext'],
    'domainName' | 'stage'
  >,
  connection_id: string,
  message: string
): Promise<ErrorResponses | null> => {
  const apigwMgmtApi = new ApiGatewayManagementApi({
    apiVersion: '2018-11-29',
    endpoint: requestContext.domainName + '/' + requestContext.stage,
  })
  try {
    await apigwMgmtApi
      .postToConnection({
        ConnectionId: connection_id,
        Data: message,
      })
      .promise()
  } catch (err) {
    console.log('Failed to send message', err.message)
    if (err.statusCode === 410) {
      return ErrorResponses.NonExistent
    }
    return ErrorResponses.Failed
  }
  return null
}
