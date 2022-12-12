import { randomBytes } from 'crypto'

// Get the frame size in bytes, dictated by AWS Websocket Message Size Limits
const MAX_FRAME_SIZE_KB = 32
const BYTES_PER_KB = 1024
const MAX_FRAME_SIZE_BYTES = MAX_FRAME_SIZE_KB * BYTES_PER_KB

// Each frame ID is a random 4 byte buffer
const ID_BYTE_SIZE = 4

/**
 * Message Frame Format:
 * Header(12B) = ID(4B) + Start of Chunk in Message(4B) + Chunk Size(4B) + Message Length(4B)
 * Frame(32KB) = Header(12B) + MessageSlice(length < 32KB - 12B)
 */
export const sliceMessageChunks = (
  message: string,
  frameSizeBytes = MAX_FRAME_SIZE_BYTES,
  idByteSize = ID_BYTE_SIZE
): Buffer[] => {
  const frames: Buffer[] = []
  const messageBuffer = Buffer.from(message)
  const headerSizeBytes = 16
  const messageId = randomBytes(idByteSize)
  let i = 0
  while (i < messageBuffer.byteLength) {
    // Read the bytes from the message
    const end = i + frameSizeBytes - headerSizeBytes
    const chunk = messageBuffer.slice(i, end)

    // assemble the message frame
    const frame = Buffer.alloc(chunk.byteLength + headerSizeBytes)
    let idx = 0
    idx = messageId.copy(frame, idx) // message ID
    idx = frame.writeUInt32BE(i, idx) // offset of chunk in message
    idx = frame.writeUInt32BE(chunk.byteLength, idx) // size of chunk
    idx = frame.writeUInt32BE(messageBuffer.byteLength, idx) // size of message
    chunk.copy(frame, idx)
    frames.push(frame)

    // increment the message buffer reader index
    i = end
  }
  return frames
}
