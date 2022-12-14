import { DynamoDB } from 'aws-sdk'
import { isOrganization } from '@models/organization'
import { IOPutItem } from '@services/ddb'

export const putOrganization = async (item: unknown): Promise<void> => {
  if (!isOrganization(item)) {
    throw new Error('Not a valid organization')
  }
  await IOPutItem('Organization', item)
}
