import { JSONSchemaType } from 'ajv'
import { validateSchema } from '@/utils/validate-schema'

export interface IProject {
  __type: 'project'
  id: string
  name: string
  organization_id: string
  updated_at: string
}

const schema: JSONSchemaType<IProject> = {
  type: 'object',
  properties: {
    __type: { type: 'string', const: 'project' },
    id: { type: 'string' },
    name: { type: 'string' },
    organization_id: { type: 'string' },
    updated_at: { type: 'string' },
  },
  required: ['__type', 'id', 'name', 'organization_id', 'updated_at'],
}

export const isProject = validateSchema<IProject>(schema)
