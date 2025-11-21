import type { Channel } from '../chan'

export type SleepInstruction<T> = {
  _tag: 'sleep'
  ms: number
  channel: Channel<T>
}

export const sleep = <T>(
  channel: Channel<T>,
  ms: number,
): SleepInstruction<T> => {
  return { _tag: 'sleep', ms, channel }
}
