import { APIGatewayProxyHandler } from 'aws-lambda'

export const handler = () => {}

export const authorizer = () => {}

export const onDisconnect: APIGatewayProxyHandler = () => {
  console.log('Todo: remove websockets from db')
}
