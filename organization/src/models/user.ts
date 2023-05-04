import { JSONSchemaType } from 'ajv'
import { validateSchema } from '@/utils/validate-schema'

export interface IUser {
  __type: 'user'
  id: string
  name: string
  email: string
  organization_id: string
  updated_at: string
}

const schema: JSONSchemaType<IUser> = {
  type: 'object',
  properties: {
    __type: { type: 'string', const: 'user' },
    id: { type: 'string' },
    name: { type: 'string' },
    email: { type: 'string' },
    organization_id: { type: 'string' },
    updated_at: { type: 'string' },
  },
  required: ['__type', 'id', 'name', 'email', 'organization_id', 'updated_at'],
}

export const isUser = validateSchema<IUser>(schema)
