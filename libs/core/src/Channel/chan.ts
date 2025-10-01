import { isObjectWithKey } from 'src/utils/object/isObjectWithKey'
import { buffer, type BufferStrategy } from './buffer'
import type { Channel } from './types'

type Options = {
  strategy?: BufferStrategy
}

export function chan<T>(bufferSize?: number, options?: Options): Channel<T> {
  return {
    _tag: 'channel',
    buffer: buffer(bufferSize ?? 1024, options?.strategy ?? 'fixed'),
    closed: false,
    takers: [],
    listeners: [],
  }
}
export const isChannel = (v: unknown): v is Channel =>
  isObjectWithKey(v, '_tag') && v['_tag'] === 'channel'
