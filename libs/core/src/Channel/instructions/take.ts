import type { Channel } from '../chan'

export type TakeInstruction<T> = {
  _tag: 'take'
  channel: Channel<T>
}

export function take<T>(channel: Channel<T>): TakeInstruction<T> {
  return { _tag: 'take', channel }
}
