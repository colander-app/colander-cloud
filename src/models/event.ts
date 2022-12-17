import { JSONSchemaType } from 'ajv'
import { validateSchema } from '@/utils/validate-schema'

export interface IEvent {
  __type: 'event'
  id: string
  resource_id: string
  start_date: string
  end_date: string
  label: string
  color: string
  tentative: boolean
  updated_at: string
}

const schema: JSONSchemaType<IEvent> = {
  type: 'object',
  properties: {
    __type: { type: 'string', const: 'event' },
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
}

export const isEvent = validateSchema<IEvent>(schema)
