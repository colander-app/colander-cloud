import { getOrgSubscriptionsByOrg } from '@/lib/orgSubscription'
import { IProject, isProject } from '@/models/project'
import { IOPutItem } from '@/services/ddb'
import { IONotifySubscribers } from '@/services/websocket'

export const onPutProject = async (item: unknown): Promise<void> => {
  if (!isProject(item)) {
    throw new Error('Not a valid project')
  }
  await IOPutItem('Organization', item)
}

export const onProjectChanged = async (item: IProject) => {
  const subscriptions = await getOrgSubscriptionsByOrg(item.organization_id)
  await IONotifySubscribers([item], subscriptions)
}
