import { JSONSchemaType } from 'ajv'
import { toBytes, toSeconds } from '@utils/converter'
import { validateSchema } from '@utils/validate-schema'

export const MAX_CONCURRENT_PART_UPLOADS = 2
export const MAX_BYTES = toBytes(590, 'mb')
export const UPLOAD_PART_SIZE = toBytes(5, 'mb')
export const EXPIRE_UPLOAD_SECONDS = toSeconds(8, 'hr')
export const EXPIRE_UPLOAD_READLINK = toSeconds(7, 'day')

export interface UploadPart {
  uploaded: boolean
  start_byte: number
  end_byte: number
  part: number
  etag?: string
  signed_upload_url?: string
}

export interface IUpload {
  __type: 'upload'
  id: string
  upload_id?: string
  status: 'uploading' | 'failed-max-size' | 'failed' | 'complete'
  event_id: string
  resource_id: string
  uploader: string
  filename: string
  content_type: string
  size: number
  parts?: Array<UploadPart>
  read_link?: {
    expire_at: number
    url: string
  }
  updated_at: string
}

const schema: JSONSchemaType<IUpload> = {
  type: 'object',
  properties: {
    __type: { type: 'string', const: 'upload' },
    id: { type: 'string' },
    upload_id: { type: 'string', nullable: true },
    status: {
      type: 'string',
      enum: ['uploading', 'failed-max-size', 'failed', 'complete'],
    },
    event_id: { type: 'string' },
    resource_id: { type: 'string' },
    uploader: { type: 'string' },
    filename: { type: 'string' },
    content_type: { type: 'string' },
    size: { type: 'number' },
    read_link: {
      type: 'object',
      nullable: true,
      properties: {
        expire_at: { type: 'number' },
        url: { type: 'string' },
      },
      required: ['expire_at', 'url'],
    },
    parts: {
      type: 'array',
      nullable: true,
      items: {
        type: 'object',
        properties: {
          uploaded: { type: 'boolean' },
          start_byte: { type: 'number' },
          end_byte: { type: 'number' },
          part: { type: 'number' },
          etag: { type: 'string', nullable: true },
          signed_upload_url: { type: 'string', nullable: true },
        },
        required: ['uploaded', 'start_byte', 'end_byte'],
      },
      minItems: 0,
      maxItems: 1000,
    },
    updated_at: { type: 'string' },
  },
  required: [
    '__type',
    'id',
    'status',
    'event_id',
    'resource_id',
    'uploader',
    'filename',
    'content_type',
    'size',
    'updated_at',
  ],
}

export const isUpload = validateSchema<IUpload>(schema)
