import { isEmpty as isEmptyBuffer } from './buffer'
import type { Channel } from './chan'

export function isEmpty<T>(channel: Channel<T>): boolean {
  return isEmptyBuffer(channel.buffer)
}
