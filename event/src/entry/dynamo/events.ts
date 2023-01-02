import { DynamoDB } from 'aws-sdk'
import { DynamoDBStreamHandler } from 'aws-lambda'
import { isEventSubscription } from '@/models/eventSubscription'
import { isEvent } from '@/models/event'
import { isUpload } from '@/models/upload'
import { onUploadChanged } from '@/controllers/upload'
import { onEventChanged } from '@/controllers/event'
import { onEventSubscriptionChanged } from '@/controllers/eventSubscription'

export const handler: DynamoDBStreamHandler = async (event) => {
  const record = event.Records[0]
  try {
    if (record.eventName === 'INSERT' || record.eventName === 'MODIFY') {
      const item: Readonly<Record<string, any>> = DynamoDB.Converter.unmarshall(
        record.dynamodb?.NewImage ?? {}
      )
      if (isEventSubscription(item)) {
        await onEventSubscriptionChanged(item)
      } else if (isEvent(item)) {
        await onEventChanged(item)
      } else if (isUpload(item)) {
        await onUploadChanged(item)
      } else {
        console.log('Unable to identify record type.', item)
      }
    }
  } catch (err) {
    console.log('Unable to process event table stream', err)
  }
}
