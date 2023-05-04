import { JSONSchemaType } from 'ajv'
import { validateSchema } from '@/utils/validate-schema'

export interface IUserToken {
  __type: 'token'
  id: string
  client_info: string
  family_id: string
  parent_token?: string
  refresh_token: string
  expire_at: number
}

const schema: JSONSchemaType<IUserToken> = {
  type: 'object',
  properties: {
    __type: { type: 'string', const: 'token' },
    id: { type: 'string' },
    family_id: { type: 'string' },
    client_info: { type: 'string' },
    parent_token: { type: 'string', nullable: true },
    refresh_token: { type: 'string' },
    expire_at: { type: 'number' },
  },
  required: [
    '__type',
    'id',
    'family_id',
    'client_info',
    'refresh_token',
    'expire_at',
  ],
}

export const isUserToken = validateSchema<IUserToken>(schema)
