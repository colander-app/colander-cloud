import { JSONSchemaType } from 'ajv'
import { validateSchema } from '@utils/validate-schema'

export interface IOrganization {
  __type: 'organization'
  id: string
  name: string
  updated_at: string
}

const schema: JSONSchemaType<IOrganization> = {
  type: 'object',
  properties: {
    __type: { type: 'string', const: 'organization' },
    id: { type: 'string' },
    name: { type: 'string' },
    updated_at: { type: 'string' },
  },
  required: ['__type', 'id', 'name', 'updated_at'],
}

export const isOrganization = validateSchema<IOrganization>(schema)
