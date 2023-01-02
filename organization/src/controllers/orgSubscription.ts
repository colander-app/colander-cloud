import { getItemsForOrg } from '@/lib/orgSubscription'
import { IOrgSubscription, isOrgSubscription } from '@/models/orgSubscription'
import { IOPutItem } from '@/services/ddb'
import { IOSendMessageWS } from '@/services/websocket'

export const onPutOrgSubscription = async (
  requestContext: {
    connectionId?: string
    domainName?: string
    stage?: string
  },
  organization_id: string,
  expire_at: number
): Promise<void> => {
  const subscription = {
    __type: 'orgSubscription',
    id: `${requestContext.connectionId}_${organization_id}`,
    websocket_id: requestContext.connectionId,
    requestContext,
    expire_at,
    organization_id,
  }
  if (!isOrgSubscription(subscription)) {
    throw new Error('Invalid subscription format')
  }
  await IOPutItem(process.env.ORGANIZATION_TABLE_NAME!, subscription)
}

export const onOrgSubscriptionChanged = async (item: IOrgSubscription) => {
  const items = await getItemsForOrg(item.organization_id)
  await IOSendMessageWS(
    item.requestContext,
    item.websocket_id,
    JSON.stringify(items)
  )
}
