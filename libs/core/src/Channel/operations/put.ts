import { isChannel } from '../chan'
import type { Channel } from '../types'

export type PutInstruction<T = unknown> = {
  _tag: 'put'
  value: T | Promise<T>
  channel?: Channel<T>
}
export function put<T>(
  channel: Channel<T>,
  value: T | Promise<T>,
): PutInstruction<T>
export function put<T>(value: T | Promise<T>): PutInstruction<T>
export function put<T>(
  valueOrChannel: T | Promise<T> | Channel<T>,
  value?: T | Promise<T>,
): PutInstruction<T> {
  if (isChannel(valueOrChannel)) {
    return {
      _tag: 'put',
      value: value as T | Promise<T>,
      channel: valueOrChannel,
    }
  }
  return { _tag: 'put', value: valueOrChannel as T | Promise<T> }
}
