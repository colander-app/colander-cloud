import { getItemsForResource } from '@/lib/event'
import { IOUpdateExpiredUploadReadLinks } from '@/lib/upload/readLink'
import { IEventSubscription } from '@/models/eventSubscription'
import { isUpload } from '@/models/upload'
import { IOSendMessageWS } from '@/services/websocket'

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
