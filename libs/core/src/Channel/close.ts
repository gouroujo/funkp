import { Channel, go } from './index'
import { take } from './operations'

export function close<T>(channel: Channel<T>): void {
  go(
    function* (channel: Channel<T>) {
      const lastValue = (yield take(channel)) as T
      channel.closed = true
      // notify all takers that the channel is closed
      channel.takers?.forEach((cb) => cb(null))
      channel.listeners?.forEach((cb) => cb(lastValue))
    },
    [channel],
  )
}
