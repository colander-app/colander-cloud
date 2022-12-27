import { getItemsForResource } from '@/lib/event'
import { IOUpdateExpiredUploadReadLinks } from '@/lib/upload/readLink'
import {
  IEventSubscription,
  isEventSubscription,
} from '@/models/eventSubscription'
import { isUpload } from '@/models/upload'
import { IOPutItem } from '@/services/ddb'
import { IOSendMessageWS } from '@/services/websocket'

export const onPutEventSubscription = async (
  requestContext: {
    connectionId?: string
    domainName?: string
    stage?: string
  },
  query: {
    resource_id: string
    start_date: string
    end_date: string
  },
  expire_at: number
): Promise<void> => {
  const subscription = {
    __type: 'eventSubscription',
    id: `${requestContext.connectionId}_${query.resource_id}`,
    websocket_id: requestContext.connectionId,
    requestContext,
    expire_at,
    subscription_resource_id: query.resource_id,
    query: {
      resource_id: query.resource_id,
      start_date: query.start_date,
      end_date: query.end_date,
    },
  }
  if (!isEventSubscription(subscription)) {
    throw new Error('Invalid subscription format')
  }
  await IOPutItem('Event', subscription)
}

export const onEventSubscriptionChanged = async (item: IEventSubscription) => {
  const resource_items = await getItemsForResource(
    item.subscription_resource_id
  )
  await IOUpdateExpiredUploadReadLinks(resource_items.filter(isUpload))
  await IOSendMessageWS(
    item.requestContext,
    item.websocket_id,
    JSON.stringify(resource_items)
  )
}
