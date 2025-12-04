import type { Effect } from '../effect'
import { effectable } from '../internal/effectable'

export const suspend = <Succcess, Failure, Requirements>(
  fn: () => Effect<Succcess, Failure, Requirements>,
): Effect<Succcess, Failure, Requirements> => {
  return effectable([...fn().ops])
}

if (import.meta.vitest) {
  const { it, expect, describe, expectTypeOf } = import.meta.vitest
  const Effect = await import('src/Effect')

  describe('Effect.suspend', () => {
    it('should return the right type', () => {
      const effect = Effect.suspend(() => Effect.succeed(42))
      expectTypeOf(effect).toEqualTypeOf<Effect<number, never, never>>()
    })

    it('should unify return type', () => {
      const effect = (a: number, b: number) =>
        Effect.suspend(() =>
          b === 0
            ? Effect.fail('Cannot divide by zero' as const)
            : Effect.succeed(a / b),
        )
      expectTypeOf(effect).returns.toEqualTypeOf<
        Effect<number, 'Cannot divide by zero', never>
      >()
    })

    it('should resolve the effect', async () => {
      const effect = Effect.suspend(() => Effect.succeed(42))
      await expect(Effect.runPromise(effect)).resolves.toEqual(42)
    })
  })
}
