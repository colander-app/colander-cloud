import { getEventSubscriptionsByResourceAndRange } from '@/lib/eventSubscription'
import { IEvent, isEvent } from '@/models/event'
import { IOPutItem } from '@/services/ddb'
import { IONotifySubscribers } from '@/services/websocket'

export const onPutEvent = async (item: unknown): Promise<void> => {
  if (!isEvent(item)) {
    throw new Error('Not a valid event')
  }
  await IOPutItem('Event', item)
}

export const onEventChanged = async (item: IEvent) => {
  const subscriptions = await getEventSubscriptionsByResourceAndRange(
    item.resource_id,
    item.start_date,
    item.end_date
  )
  await IONotifySubscribers([item], subscriptions)
}
