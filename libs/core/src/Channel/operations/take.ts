import type { Channel } from '../types'

export type TakeInstruction<T = any> = {
  _tag: 'take'
  channel?: Channel<T>
}
export function take<T>(channel: Channel<T>): TakeInstruction<T>
export function take(): TakeInstruction
export function take<T>(channel?: Channel<T>): TakeInstruction<T> {
  return { _tag: 'take', ...(channel ? { channel } : {}) }
}
