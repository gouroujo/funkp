import { absurd } from 'src/functions'
import * as O from 'src/Option'

export type BufferStrategy = 'fixed' | 'dropping' | 'sliding'

export type Buffer<T> = {
  _size: number
  _buffer: T[]
  put: (el: T) => boolean
  take: () => O.Option<T>
  size: () => number
}
export const isEmpty = <T>(buf: Buffer<T>): boolean => buf.size() === 0
export const fillWith = <T, V extends T>(buf: Buffer<T>, value: V): void => {
  let index = buf._buffer.length
  while (index < buf._size) {
    buf._buffer[index] = value
    index++
  }
}

export const MAX_BUFFER_SIZE = 1024

export const buffer = <T>(
  size: number,
  strategy: BufferStrategy,
): Buffer<T> => {
  if (size !== undefined && size > MAX_BUFFER_SIZE) {
    throw new Error(
      `maximum buffer size is ${MAX_BUFFER_SIZE}, receveied ${size}`,
    )
  }
  if (size !== undefined && size < 0) {
    throw new Error(`buffer size can't be negative`)
  }
  switch (strategy) {
    case 'dropping':
      return droppingBuffer(size)
    case 'fixed':
      return fixedBuffer(size)
    case 'sliding':
      return slidingBuffer(size)
    default:
      absurd(strategy)
  }
}

export const droppingBuffer = <T>(size: number): Buffer<T> => ({
  _buffer: [] as T[],
  _size: size,
  put(element: T): boolean {
    if (this._buffer.length >= size) return true
    this._buffer.push(element)
    return true
  },
  take(): O.Option<T> {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this._buffer.length === 0 ? O.none() : O.some(this._buffer.shift()!)
  },
  size(): number {
    return this._buffer.length
  },
})
export const fixedBuffer = <T>(size: number): Buffer<T> => ({
  _buffer: [] as T[],
  _size: size,
  put(element: T): boolean {
    if (this._buffer.length >= size) return false
    this._buffer.push(element)
    return true
  },
  take(): O.Option<T> {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this._buffer.length === 0 ? O.none() : O.some(this._buffer.shift()!)
  },
  size(): number {
    return this._buffer.length
  },
})
export const slidingBuffer = <T>(size: number): Buffer<T> => ({
  _buffer: [] as T[],
  _size: size,
  put(element: T): boolean {
    const length = this._buffer.push(element)
    if (length > size) this._buffer.shift()
    return true
  },
  take(): O.Option<T> {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this._buffer.length === 0 ? O.none() : O.some(this._buffer.shift()!)
  },
  size(): number {
    return this._buffer.length
  },
})

if (import.meta.vitest) {
  const { it, describe, expect, expectTypeOf } = import.meta.vitest

  describe('Channel.buffer', () => {
    it('should create a fixed buffer and respect its size', () => {
      const buf = buffer<number>(2, 'fixed')
      expectTypeOf(buf).toEqualTypeOf<Buffer<number>>()
      expect(buf.size()).toBe(0)
      expect(buf.put(1)).toBe(true)
      expect(buf.put(2)).toBe(true)
      expect(buf.size()).toBe(2)
      expect(buf.put(3)).toBe(false)
      expect(buf.size()).toBe(2)
      expect(buf.take()).toEqualSome(1)
      expect(buf.take()).toEqualSome(2)
      expect(buf.take()).toBeNone()
      expect(buf.size()).toBe(0)
    })

    it('should create a dropping buffer and drop new elements when full', () => {
      const buf = buffer<number>(2, 'dropping')
      expectTypeOf(buf).toEqualTypeOf<Buffer<number>>()
      expect(buf.size()).toBe(0)
      expect(buf.put(1)).toBe(true)
      expect(buf.put(2)).toBe(true)
      expect(buf.size()).toBe(2)
      expect(buf.put(3)).toBe(true)
      expect(buf.size()).toBe(2)
      expect(buf.take()).toEqualSome(1)
      expect(buf.take()).toEqualSome(2)
      expect(buf.take()).toBeNone()
      expect(buf.size()).toBe(0)
    })

    it('should create a sliding buffer and slide out oldest when full', () => {
      const buf = buffer<number>(2, 'sliding')
      expectTypeOf(buf).toEqualTypeOf<Buffer<number>>()
      expect(buf.size()).toBe(0)
      expect(buf.put(1)).toBe(true)
      expect(buf.put(2)).toBe(true)
      expect(buf.size()).toBe(2)
      expect(buf.put(3)).toBe(true)
      expect(buf.size()).toBe(2)
      expect(buf.take()).toEqualSome(2)
      expect(buf.take()).toEqualSome(3)
      expect(buf.take()).toBeNone()
      expect(buf.size()).toBe(0)
    })

    it('should throw for unknown strategy', () => {
      // @ts-expect-error for test purpose
      expect(() => buffer(2, 'unknown')).toThrow()
    })

    it('should work with strings and objects', () => {
      const buf = buffer<string>(2, 'fixed')
      expect(buf.put('a')).toBe(true)
      expect(buf.put('b')).toBe(true)
      expect(buf.put('c')).toBe(false)
      expect(buf.take()).toEqualSome('a')
      expect(buf.take()).toEqualSome('b')
      expect(buf.take()).toBeNone()

      const objBuf = buffer<{ x: number }>(1, 'dropping')
      expect(objBuf.put({ x: 42 })).toBe(true)
      expect(objBuf.put({ x: 99 })).toBe(true)
      expect(objBuf.size()).toBe(1)
      expect(objBuf.take()).toEqualSome({ x: 42 })
      expect(objBuf.take()).toBeNone()
    })

    it('should handle empty buffer take', () => {
      const buf = buffer<number>(2, 'fixed')
      expect(buf.take()).toBeNone()
    })
  })
}
