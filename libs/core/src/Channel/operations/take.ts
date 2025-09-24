import { Channel } from '..'

export type TakeInstruction<T = unknown> = {
  _tag: 'take'
  channel: Channel<T>
}

export const take = <T>(channel: Channel<T>): TakeInstruction<T> => {
  return { _tag: 'take', channel }
}
export const takeHandler = <T>(
  channel: Channel<T>,
  cb: (value: T | null) => void,
) => {
  if (channel.closed) return cb(null)
  if (channel.buffer.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const value = channel.buffer.pop()!
    cb(value)
  } else {
    channel.takers = [...(channel.takers ?? []), cb]
  }
}
