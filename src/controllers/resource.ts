import { getOrgSubscriptionsByOrg } from '@/lib/orgSubscription'
import { IResource, isResource } from '@/models/resource'
import { IOPutItem } from '@/services/ddb'
import { IONotifySubscribers } from '@/services/websocket'

export const onPutResource = async (item: unknown): Promise<void> => {
  if (!isResource(item)) {
    throw new Error('Not a valid resource')
  }
  await IOPutItem('Organization', item)
}

export const onResourceChanged = async (item: IResource) => {
  const subscriptions = await getOrgSubscriptionsByOrg(item.organization_id)
  await IONotifySubscribers([item], subscriptions)
}
