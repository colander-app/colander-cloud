import Ajv from 'ajv'
import { JTDDataType } from 'ajv/dist/jtd'

const schema = {
  type: 'object',
  properties: {
    __type: { const: 'resource' },
    id: { type: 'string' },
    name: { type: 'string' },
    organization_id: { type: 'string' },
    updated_at: { type: 'string' },
  },
  required: ['__type', 'id', 'name', 'organization_id', 'updated_at'],
} as const

export type IResource = JTDDataType<typeof schema>

const ajv = new Ajv()
export const isResource = (input: any): input is IResource => {
  const validate = ajv.compile(schema)
  return validate(input)
}
