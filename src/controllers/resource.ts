import { isResource } from '@/models/resource'
import { IOPutItem } from '@/services/ddb'

export const onPutResource = async (item: unknown): Promise<void> => {
  if (!isResource(item)) {
    throw new Error('Not a valid resource')
  }
  await IOPutItem('Organization', item)
}
