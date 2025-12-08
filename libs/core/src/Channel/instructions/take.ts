import type { Channel } from '../chan'

export type TakeInstruction<T> = {
  _tag: 'take'
  channel: Channel<T, any>
  callback?: (value: T) => void
}

export function take<T>(
  channel: Channel<T, any>,
  callback?: (value: T) => void,
): TakeInstruction<T> {
  return { _tag: 'take', channel, ...(callback ? { callback } : {}) }
}
