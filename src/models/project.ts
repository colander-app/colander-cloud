import { JSONSchemaType } from 'ajv'
import { validateSchema } from '../utils/validate-schema'

const MAX_EVENTS_PER_PROJECT = 250

export interface IProject {
  __type: 'project'
  id: string
  name: string
  events: Array<string>
  organization_id: string
  updated_at: string
}

const schema: JSONSchemaType<IProject> = {
  type: 'object',
  properties: {
    __type: { type: 'string', const: 'project' },
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
}

export const isProject = validateSchema<IProject>(schema)
