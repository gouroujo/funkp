import { Effect, runPromise } from '..'
import { absurd } from '../../functions'

export function fail<Failure>(error: Failure): Effect<never, Failure, never> {
  return {
    _tag: 'Fail',
    error,
    *[Symbol.iterator]() {
      yield this
      absurd()
    },
  }
}

if (import.meta.vitest) {
  const { describe, it, expect, expectTypeOf } = import.meta.vitest

  describe('Effect.fail', () => {
    it('should fail with the provided number', () => {
      const effect = fail(123)
      expectTypeOf(effect).toEqualTypeOf<Effect<never, number, never>>()
      expect(runPromise(effect)).toEqual({ _tag: 'Left', left: 123 })
    })
    it('should fail with the provided string', () => {
      const effect = fail('foo' as const)
      expectTypeOf(effect).toEqualTypeOf<Effect<never, 'foo', never>>()
      expect(runPromise(effect)).toEqual({ _tag: 'Left', left: 'foo' })
    })
    it('should fail with the provided number', () => {
      const effect = fail(true)
      expectTypeOf(effect).toEqualTypeOf<Effect<never, boolean, never>>()
      expect(runPromise(effect)).toEqual({ _tag: 'Left', left: true })
    })
  })
}
