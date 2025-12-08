import * as Op from '../../RuntimeOp'

import type { Effect } from '../effect'
import { effectable } from '../internal/effectable'

export const succeed = <Success>(
  value: Success,
): Effect<Success, never, never> => {
  return effectable<Success, never, never>([Op.pure(value)])
}

export const of = succeed

if (import.meta.vitest) {
  const { it, expect, describe, expectTypeOf } = import.meta.vitest
  const Effect = await import('src/Effect')

  describe('Effect.succeed', () => {
    it.each([123, 0, -1, 3.14, Number.MAX_VALUE, Number.MIN_VALUE, NaN])(
      'should succeed with the provided number : "%d"',
      async (v) => {
        const effect = Effect.succeed(v)
        expectTypeOf(effect).toEqualTypeOf<Effect<number, never, never>>()
        const result = await Effect.runPromise(effect)
        expect(result).toEqual(v)
      },
    )
    it.each(['foo', '', ' '])(
      'should succeed with the provided string: "%s"',
      async (v) => {
        const effect = Effect.succeed(v)
        expectTypeOf(effect).toEqualTypeOf<Effect<string, never, never>>()
        const result = await Effect.runPromise(effect)
        expect(result).toEqual(v)
      },
    )
    it.each([true, false])(
      'should succeed with the provided boolean: "%s"',
      async (v) => {
        const effect = Effect.succeed(v)
        expectTypeOf(effect).toEqualTypeOf<Effect<boolean, never, never>>()
        const result = await Effect.runPromise(effect)
        expect(result).toEqual(v)
      },
    )
    it.each([null, undefined])(
      'should succeed with special values : "%s"',
      async (v) => {
        const effect = Effect.succeed(v)
        const result = await Effect.runPromise(effect)
        expect(result).toEqual(v)
      },
    )
  })
}
