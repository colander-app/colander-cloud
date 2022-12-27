import { DynamoDB } from 'aws-sdk'
import { DynamoDBStreamHandler } from 'aws-lambda'
import { onResourceChanged } from '@/controllers/resource'
import { isResource } from '@/models/resource'
import { isProject } from '@/models/project'
import { onProjectChanged } from '@/controllers/project'
import { isOrgSubscription } from '@/models/orgSubscription'
import { onOrgSubscriptionChanged } from '@/controllers/orgSubscription'

export const handler: DynamoDBStreamHandler = async (event) => {
  const record = event.Records[0]
  try {
    if (record.eventName === 'INSERT' || record.eventName === 'MODIFY') {
      const item: Readonly<Record<string, any>> = DynamoDB.Converter.unmarshall(
        record.dynamodb?.NewImage ?? {}
      )
      if (isResource(item)) {
        await onResourceChanged(item)
      } else if (isProject(item)) {
        await onProjectChanged(item)
      } else if (isOrgSubscription(item)) {
        await onOrgSubscriptionChanged(item)
      } else {
        console.log('Unable to identify record type.', item)
      }
    }
  } catch (err) {
    console.log('Unable to process org table stream', err)
  }
}
