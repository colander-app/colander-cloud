import { toBytes, toSeconds } from '@/utils/converter'

// Ensure we don't create an infinite loop updating upload state
export const MAX_ITERATIVE_UPDATES = 50
export const MAX_CONCURRENT_PART_UPLOADS = 2
export const MAX_BYTES = toBytes(590, 'mb')
export const UPLOAD_PART_SIZE = toBytes(5, 'mb')
export const EXPIRE_UPLOAD_SECONDS = toSeconds(8, 'hr')
export const EXPIRE_UPLOAD_READLINK = toSeconds(7, 'day')
