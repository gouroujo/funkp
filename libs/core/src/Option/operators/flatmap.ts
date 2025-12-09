import type { Option } from '../index'
import { isSome } from '../refinements/isSome'

/**
 * Returns the result of applying `f` to the value inside `Some`, or `None` if the input is `None`.
 * Curried for composability.
 * @param mapFn - Function to apply to the value inside `Some`
 * @returns A function that takes an Option and returns an Option
 * @example
 * ```typescript
 * import { flatmap, some, none, Option } from '@funkp/core/Option'
 * const double = (n: number) => some(n * 2)
 * flatmap(double)(some(2)) // { _tag: 'Some', value: 4 }
 * flatmap(double)(none) // { _tag: 'None' }
 * ```
 */
export const flatmap = <A, B>(
  mapFn: (a: A) => Option<B>,
): ((fa: Option<A>) => Option<B>) => {
  return (fa) => (isSome(fa) ? mapFn(fa.value) : fa)
}

if (import.meta.vitest) {
  const { describe, it, expect, expectTypeOf } = import.meta.vitest
  const Option = await import('src/Option')

  describe('Option.flatmap', () => {
    it('should flatmap Some value', () => {
      const double = (n: number) => Option.some(n * 2)
      const result = Option.flatmap(double)(Option.some(2))
      expectTypeOf(result).toEqualTypeOf<Option<number>>()
      expect(result).toEqual({ _tag: 'Some', value: 4 })
    })

    it('should return None for None input', () => {
      const double = (n: number) => Option.some(n * 2)
      const result = Option.flatmap(double)(Option.none())
      expectTypeOf(result).toEqualTypeOf<Option<number>>()
      expect(result).toEqual(Option.none())
    })

    it('should allow chaining with None result', () => {
      const toNone = (_: number) => Option.none()
      const result = Option.flatmap(toNone)(Option.some(1))
      //   expectTypeOf(result).toEqualTypeOf<Option<never>>()
      expect(result).toEqual(Option.none())
    })
  })
}
