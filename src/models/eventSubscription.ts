import { JSONSchemaType } from 'ajv'
import { validateSchema } from '@utils/validate-schema'

export interface IEventSubscription {
  __type: 'eventSubscription'
  id: string
  expire_at: number
  websocket_id: string
  subscription_resource_id: string
  requestContext: {
    connectionId: string
    domainName: string
    stage: string
  }
  query: {
    resource_id: string
    start_date: string
    end_date: string
  }
}

const schema: JSONSchemaType<IEventSubscription> = {
  type: 'object',
  properties: {
    __type: { type: 'string', const: 'eventSubscription' },
    id: { type: 'string' },
    expire_at: { type: 'number' },
    websocket_id: { type: 'string' },
    subscription_resource_id: { type: 'string' },
    requestContext: {
      type: 'object',
      properties: {
        connectionId: { type: 'string' },
        domainName: { type: 'string' },
        stage: { type: 'string' },
      },
      required: ['connectionId', 'domainName', 'stage'],
    },
    query: {
      type: 'object',
      properties: {
        resource_id: { type: 'string' },
        start_date: { type: 'string' },
        end_date: { type: 'string' },
      },
      required: ['resource_id', 'start_date', 'end_date'],
    },
  },
  required: [
    '__type',
    'id',
    'expire_at',
    'websocket_id',
    'subscription_resource_id',
    'requestContext',
    'query',
  ],
}

export const isEventSubscription = validateSchema<IEventSubscription>(schema)
