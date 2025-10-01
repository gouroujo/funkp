import { absurd } from '../functions'

export type BufferStrategy = 'fixed' | 'dropping' | 'sliding'

export type Buffer<T> = {
  _buffer: T[]
  put: (el: T) => boolean
  take: () => T | null
  size: () => number
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
  put(element: T): boolean {
    if (this._buffer.length >= size) return true
    this._buffer.push(element)
    return true
  },
  take(): T | null {
    return this._buffer.shift() ?? null
  },
  size(): number {
    return this._buffer.length
  },
})
export const fixedBuffer = <T>(size: number): Buffer<T> => ({
  _buffer: [] as T[],
  put(element: T): boolean {
    if (this._buffer.length >= size) return false
    this._buffer.push(element)
    return true
  },
  take(): T | null {
    return this._buffer.shift() ?? null
  },
  size(): number {
    return this._buffer.length
  },
})
export const slidingBuffer = <T>(size: number): Buffer<T> => ({
  _buffer: [] as T[],
  put(element: T): boolean {
    const length = this._buffer.push(element)
    if (length > size) this._buffer.shift()
    return true
  },
  take(): T | null {
    return this._buffer.shift() ?? null
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
      expect(buf.take()).toBe(1)
      expect(buf.take()).toBe(2)
      expect(buf.take()).toBe(null)
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
      expect(buf.take()).toBe(1)
      expect(buf.take()).toBe(2)
      expect(buf.take()).toBe(null)
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
      expect(buf.take()).toBe(2)
      expect(buf.take()).toBe(3)
      expect(buf.take()).toBe(null)
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
      expect(buf.take()).toBe('a')
      expect(buf.take()).toBe('b')
      expect(buf.take()).toBe(null)

      const objBuf = buffer<{ x: number }>(1, 'dropping')
      expect(objBuf.put({ x: 42 })).toBe(true)
      expect(objBuf.put({ x: 99 })).toBe(true)
      expect(objBuf.size()).toBe(1)
      expect(objBuf.take()).toEqual({ x: 42 })
      expect(objBuf.take()).toBe(null)
    })

    it('should handle empty buffer take', () => {
      const buf = buffer<number>(2, 'fixed')
      expect(buf.take()).toBe(null)
    })
  })
}
