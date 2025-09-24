import { Channel } from './index'

export function isEmpty<T>(channel: Channel<T>): boolean {
  return channel.buffer.length === 0
}
