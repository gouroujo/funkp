import type { Channel } from './chan'

export function close<T>(channel: Channel<T>, lastValue: T): void {
  setImmediate(() => {
    channel.closed = true
    // channel.takers.forEach((cb) => cb(null))
    channel.listeners.forEach(([resolve]) => resolve(lastValue))
  })
}
