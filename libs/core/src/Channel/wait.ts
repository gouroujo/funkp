import { Channel } from '.'

export const wait = <T>(channel: Channel<T>) => {
  return new Promise<T>((resolve) => {
    channel.listeners = [...(channel.listeners ?? []), resolve]
  })
}
