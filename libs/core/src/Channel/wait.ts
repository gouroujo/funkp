import type { Channel } from './types'

export const wait = <T>(channel: Channel<T>) => {
  return new Promise<T>((resolve, reject) => {
    channel.listeners = [...(channel.listeners ?? []), [resolve, reject]]
  })
}
