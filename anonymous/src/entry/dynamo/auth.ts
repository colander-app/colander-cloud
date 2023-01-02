import { DynamoDB } from 'aws-sdk'
import { DynamoDBStreamHandler } from 'aws-lambda'
import { isAuthCode } from '@/models/authCode'
import { onAuthCodeChanged } from '@/controllers/authCode'

export const handler: DynamoDBStreamHandler = async (event) => {
  const record = event.Records[0]
  try {
    if (record.eventName === 'INSERT' || record.eventName === 'MODIFY') {
      const item: Readonly<Record<string, any>> = DynamoDB.Converter.unmarshall(
        record.dynamodb?.NewImage ?? {}
      )
      if (isAuthCode(item)) {
        await onAuthCodeChanged(item)
      } else {
        console.log('Unable to identify record type.', item)
      }
    }
  } catch (err) {
    console.log('Unable to process auth table stream', err)
  }
}
