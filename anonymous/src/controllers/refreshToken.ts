import { createTokenPair, getTokenFamily } from '@/lib/token'
import { IOPutItem } from '@/services/ddb'
import { proxyEventSuccess } from '@/utils/lambda/apigateway'
import * as jwt from 'jsonwebtoken'

const JWT_SIGNING_SECRET = process.env.JWT_SIGNING_SECRET!

export const refreshToken = async (
  refresh_token: string,
  client_info: string
) => {
  const decodedToken = jwt.verify(refresh_token, JWT_SIGNING_SECRET)
  if (typeof decodedToken === 'string') {
    throw new Error('Token format invalid')
  }

  if (
    typeof decodedToken.family === 'undefined' ||
    typeof decodedToken.sub === 'undefined'
  ) {
    throw new Error('Token missing data')
  }

  const familyTokens = await getTokenFamily(decodedToken.family)
  const childToken = familyTokens.find(
    (token) => token.parent_token === refresh_token
  )
  const refreshTokenAlreadyUsed = childToken !== undefined
  if (refreshTokenAlreadyUsed) {
    throw new Error('Token already consumed')
  }

  const newTokenPair = createTokenPair(
    decodedToken.sub,
    client_info,
    decodedToken.family
  )
  await IOPutItem(process.env.AUTH_TABLE_NAME!, newTokenPair.userToken)
  return proxyEventSuccess(JSON.stringify(newTokenPair.tokens))
}
