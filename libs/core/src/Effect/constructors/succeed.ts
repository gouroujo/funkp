import type { Effect } from '..'
import * as E from '../../Either'

export const succeed = <Success>(
  value: Success,
): Effect<Success, never, never> => {
  return {
    [Symbol.iterator]() {
      return {
        next: () => ({ done: true, value: E.right(value) }),
      }
    },
  }
}

export function of<Success>(value: Success): Effect<Success, never, never> {
  return succeed(value)
}

if (import.meta.vitest) {
  const { it, expect, describe, expectTypeOf } = import.meta.vitest
  describe('Effect.succeed', async () => {
    const runPromise = (await import('../run')).runPromise

    it('should succeed with the provided number', async () => {
      const effect = succeed(123)
      expectTypeOf(effect).toEqualTypeOf<Effect<number, never, never>>()
      const result = await runPromise(effect)
      expect(result).toBeRightWith(123)
    })
    it('should succeed with the provided string', async () => {
      const effect = succeed('foo' as const)
      expectTypeOf(effect).toEqualTypeOf<Effect<'foo', never, never>>()
      const result = await runPromise(effect)
      expect(result).toBeRightWith('foo')
    })
    it('should succeed with the provided boolean', async () => {
      const effect = succeed(true)
      expectTypeOf(effect).toEqualTypeOf<Effect<boolean, never, never>>()
      const result = await runPromise(effect)
      expect(result).toBeRightWith(true)
    })
    it('should succeed with undefined', async () => {
      const effect = succeed(undefined)
      expectTypeOf(effect).toEqualTypeOf<Effect<undefined, never, never>>()
      const result = await runPromise(effect)
      expect(result).toBeRightWith(undefined)
    })
    it('should succeed with null', async () => {
      const effect = succeed(null)
      expectTypeOf(effect).toEqualTypeOf<Effect<null, never, never>>()
      const result = await runPromise(effect)
      expect(result).toBeRightWith(null)
    })
  })
}
