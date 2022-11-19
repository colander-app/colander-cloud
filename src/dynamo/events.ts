import { DynamoDB } from 'aws-sdk'
import { DynamoDBStreamHandler } from 'aws-lambda'

export const handler: DynamoDBStreamHandler = async (event) => {
  const record = event.Records[0]
  const eventName = record.eventName
  if (record.eventName === 'REMOVE') {
  }
  const oldImage = DynamoDB.Converter.unmarshall(record.dynamodb.OldImage)
  const newImage = DynamoDB.Converter.unmarshall(record.dynamodb.NewImage)
  console.log('old', oldImage)
  console.log('new', newImage)
  try {
    // then get all websocket connections
    // const connections = await getConnections()
    // await Promise.allSettled(
    //   connections.map((c) => sendMessage(event, c.id, JSON.stringify([data])))
    // )
  } catch (err) {}
}
