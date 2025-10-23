import type { Head, Last, Tail } from '../tuple'
import type { AnyFunc } from './types'

export function curryLeft<Fn extends AnyFunc>(
  fn: Fn,
): (
  arg: Parameters<Fn>[0],
) => (...rest: Tail<Parameters<Fn>>) => ReturnType<Fn> {
  return (arg) =>
    (...rest) =>
      fn(arg, ...rest)
}

export function curryRight<Fn extends AnyFunc>(
  fn: Fn,
): (
  arg: Last<Parameters<Fn>>,
) => (...rest: Head<Parameters<Fn>>) => ReturnType<Fn> {
  return (arg) =>
    (...rest) =>
      fn(...rest, arg)
}

if (import.meta.vitest) {
  const { it, describe, expect, expectTypeOf } = import.meta.vitest

  describe('curryLeft', () => {
    it('should curry a two-argument function', () => {
      const add = (a: number, b: number) => a + b
      const add5 = curryLeft(add)(5)
      expect(add5(3)).toBe(8)
      expectTypeOf(add5).toEqualTypeOf<(b: number) => number>()
    })

    it('should curry a three-argument function', () => {
      const join = (a: string, b: string, c: string) => a + b + c
      const joinA = curryLeft(join)('A')
      expect(joinA('B', 'C')).toBe('ABC')
      expectTypeOf(joinA).toEqualTypeOf<(b: string, c: string) => string>()
    })

    it('should preserve argument order', () => {
      const fn = (x: number, y: number, z: number) => `${x},${y},${z}`
      const curried = curryLeft(fn)(1)
      expect(curried(2, 3)).toBe('1,2,3')
    })
  })

  describe('curryRight', () => {
    it('should curry a two-argument function', () => {
      const add = (a: number, b: number) => a + b
      const add5 = curryRight(add)(5)
      expect(add5(3)).toBe(8)
      expectTypeOf(add5).toEqualTypeOf<(b: number) => number>()
    })

    it('should curry a three-argument function', () => {
      const join = (a: string, b: string, c: string) => a + b + c
      const joinA = curryRight(join)('C')
      expect(joinA('A', 'B')).toBe('ABC')
      expectTypeOf(joinA).toEqualTypeOf<(b: string, c: string) => string>()
    })

    it('should preserve argument order', () => {
      const fn = (x: number, y: number, z: number) => `${x},${y},${z}`
      const curried = curryRight(fn)(3)
      expect(curried(1, 2)).toBe('1,2,3')
    })
  })
}
