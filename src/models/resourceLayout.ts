import { JSONSchemaType } from 'ajv'
import { validateSchema } from '@utils/validate-schema'

export interface IResourceLayout {
  __type: 'resourceLayout'
  id: string
  name: string
  organization_id: string
  resource_ids: Array<string>
  updated_at: string
}

const schema: JSONSchemaType<IResourceLayout> = {
  type: 'object',
  properties: {
    __type: { type: 'string', const: 'resourceLayout' },
    id: { type: 'string' },
    name: { type: 'string' },
    organization_id: { type: 'string' },
    resource_ids: {
      type: 'array',
      uniqueItems: true,
      items: { type: 'string' },
      minItems: 1,
      maxItems: 20,
    },
    updated_at: { type: 'string' },
  },
  required: [
    '__type',
    'id',
    'name',
    'organization_id',
    'resource_ids',
    'updated_at',
  ],
}

export const isResourceLayout = validateSchema<IResourceLayout>(schema)
