import { IEventSubscription } from '@/models/eventSubscription'
import { APIGatewayProxyEvent } from 'aws-lambda'
import { ApiGatewayManagementApi } from 'aws-sdk'
import { IOLogRejectedPromises } from './log'

export const enum ErrorResponses {
  NonExistent = 'NonExistent',
  Failed = 'Failed',
}

/**
 * Send a JSON message to a websocket client
 */
export const IOSendMessageWS = async (
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
    // const frames = sliceMessageChunks(message)
    // const promises = frames.map(async (frame) => {
    await apigwMgmtApi
      .postToConnection({
        ConnectionId: connection_id,
        Data: message,
      })
      .promise()
    // })
    // const results = await Promise.allSettled(promises)
    // const failed = results
    //   .map((result) => (result.status === 'rejected' ? result.reason : false))
    //   .filter(Boolean)
    // if (failed.length > 0) {
    //   console.error('failed to send message to clients:', failed.length)
    // }
  } catch (err) {
    console.log('Failed to send message', err.message)
    if (err.statusCode === 410) {
      return ErrorResponses.NonExistent
    }
    return ErrorResponses.Failed
  }
  return null
}

export const IONotifySubscribers = async (
  items: unknown[],
  subscriptions: IEventSubscription[]
): Promise<void> => {
  const sendResults = await Promise.allSettled(
    subscriptions.map((subscription) =>
      IOSendMessageWS(
        subscription.requestContext,
        subscription.websocket_id,
        JSON.stringify(items)
      )
    )
  )
  IOLogRejectedPromises('onUploadChanged', sendResults)
}
