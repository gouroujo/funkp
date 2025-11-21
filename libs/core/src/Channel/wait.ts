import type { Channel } from './chan'

export const wait = <T>(channel: Channel<T>) => {
  return new Promise<T>((resolve, reject) => {
    channel.listeners = [...(channel.listeners ?? []), [resolve, reject]]
  })
}
