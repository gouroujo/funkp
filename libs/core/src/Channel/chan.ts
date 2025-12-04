import { isObjectWithKey } from 'src/utils/object/isObjectWithKey'
import * as Buffer from './buffer'

type Options<T, V extends T = T> = {
  strategy?: Buffer.BufferStrategy
  fill?: V
}

export type Channel<T> = {
  _tag: 'channel'
  takers: ((value: T) => void)[]
  // onLeft: ((value: L | null) => void)[]
  buffer: Buffer.Buffer<T>
  listeners: [resolve: (result: T) => void, reject: (result: T) => void][]
  closed: boolean
}

export function chan<T>(
  bufferSize?: number,
  options: Options<T> = {},
): Channel<T> {
  const buf = Buffer.buffer<T>(bufferSize ?? 1, options.strategy ?? 'fixed')
  if ('fill' in options) {
    Buffer.fillWith(buf, options.fill)
  }
  return {
    _tag: 'channel',
    buffer: buf,
    closed: false,
    takers: [],
    // onLeft: [],
    listeners: [],
  }
}
export const isChannel = <T>(v: unknown): v is Channel<T> =>
  isObjectWithKey(v, '_tag') && v['_tag'] === 'channel'
