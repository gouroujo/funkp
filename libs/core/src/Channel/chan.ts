import { Channel } from './index'

export function chan<T>(): Channel<T> {
  return {
    buffer: [],
    closed: false,
    takers: [],
    listeners: [],
  }
}
