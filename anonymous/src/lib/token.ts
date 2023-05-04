import { DynamoDB } from 'aws-sdk'
import { IUserToken } from '@/models/userToken'
import * as jwt from 'jsonwebtoken'
import { toSeconds } from '@/utils/converter'
import { getExpiryInSeconds } from '@/utils/date'
import { genUUID } from '@/utils/uuid'

const EXPIRE_REFRESH_TOKEN = toSeconds(1, 'day')
const EXPIRE_ACCESS_TOKEN = toSeconds(1, 'min')
const JWT_SIGNING_SECRET = process.env.JWT_SIGNING_SECRET!

const ddb = new DynamoDB.DocumentClient({
  apiVersion: '2012-08-10',
  region: process.env.AWS_REGION,
})

export const getTokenFamily = async (id: string) => {
  const query = {
    TableName: process.env.AUTH_TABLE_NAME!,
    IndexName: 'TokenByFamily',
    KeyConditionExpression: 'family_id = :id',
    ExpressionAttributeValues: {
      ':id': id,
    },
  }
  const tokens = (await ddb.query(query).promise()).Items ?? []
  return tokens
}

export const deleteTokenFamily = async (id: string) => {
  ddb.batchWrite({
    RequestItems: {
      [process.env.AUTH_TABLE_NAME!]: [
        {
          DeleteRequest: { Key: { family_id: id } },
        },
      ],
    },
  })
}

export const createTokenPair = (
  email: string,
  client_info: string,
  token_family_id: string = genUUID(),
  parent_token?: string
) => {
  const refresh_token_expiration = getExpiryInSeconds(EXPIRE_REFRESH_TOKEN)
  const issued_at_timestamp = Math.floor(Date.now() / 1000)

  const access_token = jwt.sign(
    {
      iat: issued_at_timestamp,
      sub: email,
      exp: getExpiryInSeconds(EXPIRE_ACCESS_TOKEN),
      roles: ['admin'],
    },
    JWT_SIGNING_SECRET
  )

  const refresh_token = jwt.sign(
    {
      iat: issued_at_timestamp,
      sub: email,
      exp: refresh_token_expiration,
      family: token_family_id,
    },
    JWT_SIGNING_SECRET
  )

  const userToken: IUserToken = {
    __type: 'token',
    id: genUUID(),
    family_id: token_family_id,
    client_info,
    refresh_token,
    parent_token,
    expire_at: refresh_token_expiration,
  }

  return {
    userToken,
    tokens: { access_token, refresh_token },
  }
}
