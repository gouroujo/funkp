import type { Channel } from '../chan'

export type PutInstruction<T = unknown> = {
  _tag: 'put'
  value: T | Promise<T>
  channel: Channel<T>
}

export function put<T>(
  channel: Channel<T>,
  value: T | Promise<T>,
): PutInstruction<T> {
  return {
    _tag: 'put',
    value,
    channel,
  }
}
