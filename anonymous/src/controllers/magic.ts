import { canConsumeAuthCode, deleteAuthCode, getAuthCode } from '@/lib/authCode'
import { createTokenPair } from '@/lib/token'
import { IAuthCode, isAuthCode } from '@/models/authCode'
import { IOPutItem } from '@/services/ddb'
import { toSeconds } from '@/utils/converter'
import { getExpiryInSeconds } from '@/utils/date'
import { proxyEventFailed, proxyEventSuccess } from '@/utils/lambda/apigateway'
import { genUUID } from '@/utils/uuid'

const EXPIRE_MAGIC_CODE = toSeconds(10, 'min')

// TODO create real random values
const createMagicCode = (): string =>
  Math.floor(Math.random() * 9999).toString()

export const initMagicLogin = async (email: string) => {
  const authCode: IAuthCode = {
    __type: 'code',
    id: genUUID(),
    email,
    code: createMagicCode(),
    expire_at: getExpiryInSeconds(EXPIRE_MAGIC_CODE),
  }
  if (!isAuthCode(authCode)) {
    throw new Error('Not an authorization code')
  }
  await IOPutItem(process.env.AUTH_TABLE_NAME!, authCode)
}

export const completeMagicLogin = async (
  email: string,
  code: string,
  client_info: string
) => {
  const authCode = await getAuthCode(email, code)
  if (!canConsumeAuthCode(authCode)) {
    return proxyEventFailed('failure')
  }
  await deleteAuthCode(authCode.id)

  const tokenPair = createTokenPair(email, client_info)
  await IOPutItem(process.env.AUTH_TABLE_NAME!, tokenPair.userToken)
  return proxyEventSuccess(JSON.stringify(tokenPair.tokens))
}
