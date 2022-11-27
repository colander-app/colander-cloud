import Ajv from 'ajv'
import { JTDDataType } from 'ajv/dist/jtd'

const MAX_EVENTS_PER_PROJECT = 250

const schema = {
  type: 'object',
  properties: {
    __type: { const: 'project' },
    id: { type: 'string' },
    name: { type: 'string' },
    events: {
      type: 'array',
      uniqueItems: true,
      items: { type: 'string' },
      minItems: 0,
      maxItems: MAX_EVENTS_PER_PROJECT,
    },
    organization_id: { type: 'string' },
    updated_at: { type: 'string' },
  },
  required: ['__type', 'id', 'name', 'events', 'organization_id', 'updated_at'],
} as const

export type IProject = JTDDataType<typeof schema>

const ajv = new Ajv()
export const isProject = (input: any): input is IProject => {
  const validate = ajv.compile(schema)
  return validate(input)
}
