import { getEventSubscriptionsByResourceAndRange } from '@/lib/eventSubscription'
import { IEvent, isEvent } from '@/models/event'
import { IOConditionalPut } from '@/services/ddb'
import { IONotifySubscribers } from '@/services/websocket'

const uniqueArray = <T>(input: T[]): T[] => {
  return input.filter((value, index) => input.indexOf(value) === index)
}

const diffObject = <T1 extends Record<any, any>, T2 extends Record<any, any>>(
  r1: T1,
  r2: T2
): Partial<Record<keyof T1 | keyof T2, true>> => {
  const keys = uniqueArray<keyof T1 | keyof T2>([
    ...Object.keys(r1),
    ...Object.keys(r2),
  ])
  const changed: Partial<Record<keyof T1 | keyof T2, true>> = {}
  keys.forEach((key) => {
    if (r1[key] !== r2[key]) {
      changed[key] = true
    }
  })
  return changed
}

const authorizePutEvent = (previous: IEvent, next: IEvent): boolean => {
  const changed = diffObject(previous, next)
  if (changed.id) return false
  return true
}

export const onPutEvent = async (item: unknown): Promise<void> => {
  await IOConditionalPut<IEvent>(
    process.env.EVENT_TABLE_NAME!,
    item,
    isEvent,
    authorizePutEvent
  )
}

export const onEventChanged = async (item: IEvent) => {
  const subscriptions = await getEventSubscriptionsByResourceAndRange(
    item.resource_id,
    item.start_date,
    item.end_date
  )
  await IONotifySubscribers([item], subscriptions)
}
