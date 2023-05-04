import { IAuthCode, isAuthCode } from '@/models/authCode'
import { DynamoDB } from 'aws-sdk'

const ddb = new DynamoDB.DocumentClient({
  apiVersion: '2012-08-10',
  region: process.env.AWS_REGION,
})

export const getAuthCode = async (
  email: string,
  code: string
): Promise<IAuthCode | undefined> => {
  const query = {
    TableName: process.env.AUTH_TABLE_NAME!,
    IndexName: 'AuthCodeByEmail',
    KeyConditionExpression: 'email = :e AND code = :c',
    ExpressionAttributeValues: {
      ':e': email,
      ':c': code,
    },
  }
  const items = (await ddb.query(query).promise()).Items ?? []
  if (items.length > 0) {
    return items[0] as IAuthCode
  }

  return undefined
}

export const deleteAuthCode = (id: string) => {
  return ddb.delete({ TableName: process.env.AUTH_TABLE_NAME!, Key: { id } })
}

export const canConsumeAuthCode = (
  authCode?: IAuthCode
): authCode is IAuthCode => {
  if (!authCode) {
    return false
  }

  const nowSeconds = Date.now() / 1000
  if (nowSeconds > authCode.expire_at) {
    return false
  }

  return true
}
