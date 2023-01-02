import { JSONSchemaType } from 'ajv'
import { validateSchema } from '@/utils/validate-schema'

export interface IOrgSubscription {
  __type: 'orgSubscription'
  id: string
  expire_at: number
  websocket_id: string
  organization_id: string
  requestContext: {
    connectionId: string
    domainName: string
    stage: string
  }
}

const schema: JSONSchemaType<IOrgSubscription> = {
  type: 'object',
  properties: {
    __type: { type: 'string', const: 'orgSubscription' },
    id: { type: 'string' },
    expire_at: { type: 'number' },
    websocket_id: { type: 'string' },
    organization_id: { type: 'string' },
    requestContext: {
      type: 'object',
      properties: {
        connectionId: { type: 'string' },
        domainName: { type: 'string' },
        stage: { type: 'string' },
      },
      required: ['connectionId', 'domainName', 'stage'],
    },
  },
  required: [
    '__type',
    'id',
    'expire_at',
    'websocket_id',
    'organization_id',
    'requestContext',
  ],
}

export const isOrgSubscription = validateSchema<IOrgSubscription>(schema)
