import type { Channel } from '../chan'

export type SleepInstruction<T> = {
  _tag: 'sleep'
  ms: number
  channel: Channel<T, any>
  callback?: (value: T) => void
}

export const sleep = <T>(
  channel: Channel<T, any>,
  ms: number,
  callback?: (value: T) => void,
): SleepInstruction<T> => {
  return { _tag: 'sleep', ms, channel, ...(callback ? { callback } : {}) }
}
