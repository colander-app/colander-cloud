import Ajv from 'ajv'
import { JTDDataType } from 'ajv/dist/jtd'

const schema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    websocket_id: { type: 'string' },
    subscription_resource_id: { type: 'string' },
    requestContext: {
      type: 'object',
      properties: {
        connectionId: { type: 'string' },
        domainName: { type: 'string' },
        stage: { type: 'string' },
      },
      // required: ['connectionId', 'domainName', 'stage'],
    },
    query: {
      type: 'object',
      properties: {
        resource_id: { type: 'string' },
        start_date: { type: 'string' },
        end_date: { type: 'string' },
      },
      // required: ['resource_id', 'start_date', 'end_date'],
    },
  },
  required: ['id', 'websocket_id', 'subscription_resource_id'],
} as const

export type IEventSubscription = JTDDataType<typeof schema>

const ajv = new Ajv()
export const isEventSubscription = (
  input: any
): input is IEventSubscription => {
  const validate = ajv.compile(schema)
  return validate(input)
}
