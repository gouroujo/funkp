import { isObjectWithKey } from 'src/utils/object/isObjectWithKey'
import { buffer, type Buffer, type BufferStrategy } from './buffer'

type Options = {
  strategy?: BufferStrategy
}

export type Channel<T> = {
  _tag: 'channel'
  takers: ((value: T) => void)[]
  // onLeft: ((value: L | null) => void)[]
  buffer: Buffer<T>
  listeners: [resolve: (result: T) => void, reject: (result: T) => void][]
  closed: boolean
}

export function chan<T>(bufferSize?: number, options?: Options): Channel<T> {
  return {
    _tag: 'channel',
    buffer: buffer(bufferSize ?? 1, options?.strategy ?? 'fixed'),
    closed: false,
    takers: [],
    // onLeft: [],
    listeners: [],
  }
}
export const isChannel = <T>(v: unknown): v is Channel<T> =>
  isObjectWithKey(v, '_tag') && v['_tag'] === 'channel'
