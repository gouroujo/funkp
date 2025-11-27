import type { Effect } from '../effect'
import { effectable } from '../internal/effectable'

export const suspend = <Succcess, Failure, Requirements>(
  fn: () => Effect<Succcess, Failure, Requirements>,
): Effect<Succcess, Failure, Requirements> => {
  return effectable([...fn().ops])
}

if (import.meta.vitest) {
  const { it, expect, describe, expectTypeOf } = import.meta.vitest
  describe('Effect.suspend', async () => {
    const runPromise = (await import('../run')).runPromise
    const succeed = (await import('./succeed')).succeed
    const fail = (await import('./fail')).fail

    it('should return the right type', () => {
      const effect = suspend(() => succeed(42))
      expectTypeOf(effect).toEqualTypeOf<Effect<number, never, never>>()
    })

    it('should unify return type', () => {
      const effect = (a: number, b: number) =>
        suspend(() =>
          b === 0 ? fail('Cannot divide by zero' as const) : succeed(a / b),
        )
      expectTypeOf(effect).returns.toEqualTypeOf<
        Effect<number, 'Cannot divide by zero', never>
      >()
    })

    it('should resolve the effect', async () => {
      const effect = suspend(() => succeed(42))
      await expect(runPromise(effect)).resolves.toEqual(42)
    })
  })
}
