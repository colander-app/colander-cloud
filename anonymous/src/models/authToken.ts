import { JSONSchemaType } from 'ajv'
import { validateSchema } from '@/utils/validate-schema'

export interface IAuthToken {
  __type: 'token'
  id: string
  email: string
  code: string
  expire_at: number
}

const schema: JSONSchemaType<IAuthToken> = {
  type: 'object',
  properties: {
    __type: { type: 'string', const: 'token' },
    id: { type: 'string' },
    email: { type: 'string' },
    code: { type: 'string' },
    expire_at: { type: 'number' },
  },
  required: ['__type', 'id', 'email', 'code', 'expire_at'],
}

export const isProject = validateSchema<IAuthToken>(schema)
