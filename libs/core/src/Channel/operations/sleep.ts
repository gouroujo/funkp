import { Channel } from '..'

export type SleepInstruction<T> = {
  _tag: 'sleep'
  channel: Channel<T>
  ms: number
}

export const sleep = <T>(
  channel: Channel<T>,
  ms: number,
): SleepInstruction<T> => {
  return { _tag: 'sleep', channel, ms }
}

export const sleepHandler = <T>(
  channel: Channel<T>,
  ms: number,
  cb: () => void,
) => {
  if (channel.closed) return cb()
  setTimeout(() => {
    cb()
  }, ms)
}
