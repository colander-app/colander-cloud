import { isOrganization } from '@/models/organization'
import { IOPutItem } from '@/services/ddb'

export const onPutOrganization = async (item: unknown): Promise<void> => {
  if (!isOrganization(item)) {
    throw new Error('Not a valid organization')
  }
  await IOPutItem('Organization', item)
}
