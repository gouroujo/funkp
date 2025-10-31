import * as Op from '../../RuntimeOp'

import type { Effect } from '../types'

export const succeed = <Success>(
  value: Success,
): Effect<Success, never, never> => {
  return {
    *[Symbol.iterator]() {
      return yield Op.pure(value)
    },
  }
}

export function of<Success>(value: Success) {
  return succeed(value)
}

if (import.meta.vitest) {
  const { it, expect, describe, expectTypeOf } = import.meta.vitest
  describe('Effect.succeed', async () => {
    const runPromise = (await import('../run')).runPromise

    it.each([123, 0, -1, 3.14, Number.MAX_VALUE, Number.MIN_VALUE])(
      'should succeed with the provided number : "%d"',
      async (v) => {
        const effect = succeed(v)
        expectTypeOf(effect).toEqualTypeOf<Effect<number, never, never>>()
        const result = await runPromise(effect)
        expect(result).toEqual(v)
      },
    )
    it.each(['foo', '', ' '])(
      'should succeed with the provided string: "%s"',
      async (v) => {
        const effect = succeed(v)
        expectTypeOf(effect).toEqualTypeOf<Effect<string, never, never>>()
        const result = await runPromise(effect)
        expect(result).toEqual(v)
      },
    )
    it.each([true, false])(
      'should succeed with the provided boolean: "%s"',
      async (v) => {
        const effect = succeed(v)
        expectTypeOf(effect).toEqualTypeOf<Effect<boolean, never, never>>()
        const result = await runPromise(effect)
        expect(result).toEqual(v)
      },
    )
    it.each([null, undefined])(
      'should succeed with special values : "%s"',
      async (v) => {
        const effect = succeed(v)
        const result = await runPromise(effect)
        expect(result).toEqual(v)
      },
    )
  })
}
