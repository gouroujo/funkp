import type { Channel } from './types'

export function isEmpty<T>(channel: Channel<T>): boolean {
  return channel.buffer.length === 0
}
