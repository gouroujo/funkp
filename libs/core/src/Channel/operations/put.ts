import { Channel } from '..'

export type PutInstruction<T = unknown> = {
  _tag: 'put'
  channel: Channel<T>
  value: T
}

export const put = <T>(channel: Channel<T>, value: T): PutInstruction<T> => {
  return { _tag: 'put', channel, value }
}
export const putHandler = <T>(
  channel: Channel<T>,
  value: T,
  cb: (value: T | null) => void,
) => {
  if (channel.closed) return cb(null)
  if (channel.takers && channel.takers.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const taker = channel.takers.shift()!
    cb(value)
    taker(value)
  } else {
    channel.buffer.unshift(value)
    cb(value)
  }
}
