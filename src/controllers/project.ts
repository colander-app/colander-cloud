import { isProject } from '@/models/project'
import { IOPutItem } from '@/services/ddb'

export const onPutProject = async (item: unknown): Promise<void> => {
  if (!isProject(item)) {
    throw new Error('Not a valid project')
  }
  await IOPutItem('Event', item)
}
