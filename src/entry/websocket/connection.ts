import { APIGatewayProxyHandler } from 'aws-lambda'

export const onDisconnect: APIGatewayProxyHandler = () => {
  console.log('Todo: remove websockets from db')
}
