import { Tail } from '../array/types'
import { AnyFunc } from './types'

export function curryLeft<Fn extends AnyFunc>(
  fn: Fn,
  arg: Parameters<Fn>[0],
): (...rest: Tail<Parameters<Fn>>) => ReturnType<Fn> {
  return (...rest) => fn(arg, ...rest)
}

if (import.meta.vitest) {
  const { it, describe, expect, expectTypeOf } = import.meta.vitest

  describe('curryLeft', () => {
    it('should curry a two-argument function', () => {
      const add = (a: number, b: number) => a + b
      const add5 = curryLeft(add, 5)
      expect(add5(3)).toBe(8)
      expectTypeOf(add5).toEqualTypeOf<(b: number) => number>()
    })

    it('should curry a three-argument function', () => {
      const join = (a: string, b: string, c: string) => a + b + c
      const joinA = curryLeft(join, 'A')
      expect(joinA('B', 'C')).toBe('ABC')
      expectTypeOf(joinA).toEqualTypeOf<(b: string, c: string) => string>()
    })

    it('should preserve argument order', () => {
      const fn = (x: number, y: number, z: number) => `${x},${y},${z}`
      const curried = curryLeft(fn, 1)
      expect(curried(2, 3)).toBe('1,2,3')
    })
  })
}
