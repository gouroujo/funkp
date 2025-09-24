import type { Channel } from '..'

export type AsyncInstruction<T> = {
  _tag: 'async'
  channel: Channel<T>
  promise: Promise<T>
}

export const async = <T>(
  channel: Channel<T>,
  promise: Promise<T>,
): AsyncInstruction<T> => {
  return { _tag: 'async', channel, promise }
}

export const asyncHandler = <T>(
  channel: Channel<T>,
  promise: Promise<T>,
  cb: () => void,
) => {
  promise
    .then((value) => {
      if (channel.closed) return cb()
      if (channel.takers && channel.takers.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const taker = channel.takers.shift()!
        cb()
        setImmediate(() => taker(value))
      } else {
        channel.buffer.push(value)
        cb()
      }
    })
    .catch((error) => {
      setImmediate(() => {
        channel.closed = true
        channel.takers?.forEach((cb) => cb(null))
        channel.listeners?.forEach(([_, reject]) => {
          reject(error)
        })
      })
    })
}
