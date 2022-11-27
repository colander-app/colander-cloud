import Ajv from 'ajv'
import { JTDDataType } from 'ajv/dist/jtd'

const schema = {
  type: 'object',
  properties: {
    __type: { const: 'organization' },
    id: { type: 'string' },
    name: { type: 'string' },
    organization_id: { type: 'string' },
    updated_at: { type: 'string' },
  },
  required: ['__type', 'id', 'name', 'updated_at'],
} as const

export type IOrganization = JTDDataType<typeof schema>

const ajv = new Ajv()
export const isOrganization = (input: any): input is IOrganization => {
  const validate = ajv.compile(schema)
  return validate(input)
}
