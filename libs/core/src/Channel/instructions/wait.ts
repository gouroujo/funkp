import type { Channel } from '../chan'

export type WaitInstruction<T> = {
  _tag: 'wait'
  value: Promise<unknown>
  channel: Channel<T, any>
  callback?: (value: T) => void
}

export function wait<T>(
  channel: Channel<T, any>,
  value: Promise<unknown>,
  callback?: (value: T) => void,
): WaitInstruction<T> {
  return {
    _tag: 'wait',
    value,
    channel,
    ...(callback ? { callback } : {}),
  }
}
