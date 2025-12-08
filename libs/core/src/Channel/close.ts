import { none } from 'src/Option'
import type { Channel } from './chan'

export function close<T, V>(channel: Channel<T, V>, lastValue: V): void {
  setImmediate(() => {
    channel.closed = true
    channel.takers.forEach((cb) => cb(none()))
    channel.listeners.forEach((resolve) => resolve(lastValue))
  })
}

export function onClose<T, V>(
  channel: Channel<T, V>,
  cb: (value: V) => void,
): Channel<T, V> {
  channel.listeners.push(cb)
  return channel
}
