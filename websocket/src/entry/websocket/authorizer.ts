import { APIGatewayProxyEventV2WithLambdaAuthorizer } from 'aws-lambda'
import * as jwt from 'jsonwebtoken'

const JWT_SIGNING_SECRET = process.env.JWT_SIGNING_SECRET!

export const handler = async (
  event: APIGatewayProxyEventV2WithLambdaAuthorizer<any>
): Promise<any> => {
  try {
    const authToken = event.queryStringParameters?.Auth!
    const decodedToken = jwt.verify(authToken, JWT_SIGNING_SECRET)
    if (typeof decodedToken === 'string') {
      throw new Error('Token format invalid')
    }
    console.log('token is', decodedToken)
    const { sub, roles } = decodedToken
    if (sub && Array.isArray(roles)) {
      const policy = {
        principalId: sub,
        context: {
          roles: roles.join(','),
          sub,
        },
        policyDocument: {
          Version: '2012-10-17',
          Statement: [
            {
              Action: 'execute-api:Invoke',
              Effect: 'Allow',
              Resource: '*',
            },
          ],
        },
      }
      console.log('generated policy', policy)
      return policy
    }
  } catch (err) {
    console.log('Unable to authorize user', err)
  }
  throw new Error('Unauthorized')
}
