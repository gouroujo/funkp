import { some, type Option } from '../index'
import { isSome } from '../refinements/isSome'

/**
 * Returns the result of applying `mapFn` to the value inside `Some`, or `None` if the input is `None`.
 * Curried for composability.
 * @param mapFn - Function to apply to the value inside `Some`
 * @returns A function that takes an Option and returns an Option
 * @example
 * ```typescript
 * import { map, some, none, Option } from '@funkp/core/Option'
 * const double = (n: number) => n * 2
 * map(double)(some(2)) // { _tag: 'Some', value: 4 }
 * map(double)(none) // { _tag: 'None' }
 * ```
 */
export const map = <A, B>(
  mapFn: (a: A) => B,
): ((fa: Option<A>) => Option<B>) => {
  return (fa) => (isSome(fa) ? some(mapFn(fa.value)) : fa)
}

if (import.meta.vitest) {
  const { describe, it, expect, expectTypeOf } = import.meta.vitest
  const Option = await import('src/Option')

  describe('Option.map', () => {
    it('should map Some value', () => {
      const double = (n: number) => n * 2
      const result = Option.map(double)(Option.some(2))
      expectTypeOf(result).toEqualTypeOf<Option<number>>()
      expect(result).toEqual({ _tag: 'Some', value: 4 })
    })

    it('should return None for None input', () => {
      const double = (n: number) => n * 2
      const none = Option.none()
      const result = Option.map(double)(none)
      expectTypeOf(result).toEqualTypeOf<Option<number>>()
      expect(result).toBe(none)
    })

    it('should allow identity mapping', () => {
      const id = <T>(x: T) => x
      const someVal = Option.some('x')
      const result = Option.map(id)(someVal)
      expect(result).toEqual(someVal)
    })
  })
}
