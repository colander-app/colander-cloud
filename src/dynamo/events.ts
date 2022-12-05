import { DynamoDB } from 'aws-sdk'
import { DynamoDBStreamHandler } from 'aws-lambda'
import { getEventsInRange } from '../lib/event'
import { getEventSubscriptionsByResource } from '../lib/eventSubscription'
import { isEventSubscription } from '../models/eventSubscription'
import { isEvent } from '../models/event'
import { sendMessage } from '../lib/websocket'

export const handler: DynamoDBStreamHandler = async (event) => {
  const record = event.Records[0]
  try {
    if (record.eventName === 'INSERT' || record.eventName === 'MODIFY') {
      const item = DynamoDB.Converter.unmarshall(
        record.dynamodb?.NewImage ?? {}
      )

      /**
       * Send initial range of events within time window when a new subscription is created
       */
      if (isEventSubscription(item)) {
        const initial_events = await getEventsInRange(
          item.subscription_resource_id,
          item.query.start_date,
          item.query.end_date
        )
        await sendMessage(
          item.requestContext,
          item.websocket_id,
          JSON.stringify(initial_events)
        )
      }

      /**
       * Send updates to an event to all subscribers of it's resource
       */
      if (isEvent(item)) {
        const subscriptions = await getEventSubscriptionsByResource(
          item.resource_id,
          item.start_date,
          item.end_date
        )
        await Promise.allSettled(
          subscriptions.map((subscription) =>
            sendMessage(
              subscription.requestContext,
              subscription.websocket_id,
              JSON.stringify([item])
            )
          )
        )
      }
    }
  } catch (err) {
    console.log('Unable to process event table stream', err)
  }
}
