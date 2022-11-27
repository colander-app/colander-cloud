import Ajv from 'ajv'
import { JTDDataType } from 'ajv/dist/jtd'

const schema = {
  type: 'object',
  properties: {
    __type: { const: 'resourceLayout' },
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
  required: ['__type', 'id', 'name', 'organization_id', 'updated_at'],
} as const

export type IResourceLayout = JTDDataType<typeof schema>

const ajv = new Ajv()
export const isResourceLayout = (input: any): input is IResourceLayout => {
  const validate = ajv.compile(schema)
  return validate(input)
}
