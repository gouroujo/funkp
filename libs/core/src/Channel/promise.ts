import type { Channel } from './chan'

export const promise = <T>(channel: Channel<T>) => {
  return new Promise<T>((resolve) => {
    channel.listeners = [...(channel.listeners ?? []), resolve]
  })
}
