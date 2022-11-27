import Ajv from 'ajv'
import { JTDDataType } from 'ajv/dist/jtd'

const schema = {
  type: 'object',
  properties: {
    __type: { const: 'event' },
    id: { type: 'string' },
    resource_id: { type: 'string' },
    start_date: { type: 'string' },
    end_date: { type: 'string' },
    label: { type: 'string' },
    color: { type: 'string' },
    tentative: { type: 'boolean' },
    updated_at: { type: 'string' },
  },
  required: [
    '__type',
    'id',
    'resource_id',
    'start_date',
    'end_date',
    'label',
    'color',
    'tentative',
    'updated_at',
  ],
} as const

export type IEvent = JTDDataType<typeof schema>

const ajv = new Ajv()
export const isEvent = (input: any): input is IEvent => {
  const validate = ajv.compile(schema)
  return validate(input)
}
