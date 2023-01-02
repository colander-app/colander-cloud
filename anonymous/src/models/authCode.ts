import { JSONSchemaType } from 'ajv'
import { validateSchema } from '@/utils/validate-schema'

export interface IAuthCode {
  __type: 'code'
  id: string
  email: string
  code: string
  expire_at: number
}

const schema: JSONSchemaType<IAuthCode> = {
  type: 'object',
  properties: {
    __type: { type: 'string', const: 'code' },
    id: { type: 'string' },
    email: { type: 'string' },
    code: { type: 'string' },
    expire_at: { type: 'number' },
  },
  required: ['__type', 'id', 'email', 'code', 'expire_at'],
}

export const isAuthCode = validateSchema<IAuthCode>(schema)
