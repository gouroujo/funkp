import * as Op from '../../RuntimeOp'
import type { Effect } from '../effect'
import { effectable } from '../internal/effectable'

export const fail = <Failure>(
  failure: Failure,
): Effect<never, Failure, never> => {
  return effectable<never, Failure, never>([Op.fail(failure)])
}

if (import.meta.vitest) {
  const { describe, it, expect, expectTypeOf } = import.meta.vitest
  const Effect = await import('src/Effect')

  describe('Effect.fail', () => {
    it('should fail with the provided number', async () => {
      const effect = Effect.fail(123)
      expectTypeOf(effect).toEqualTypeOf<Effect<never, number, never>>()
      await expect(Effect.runPromise(effect)).rejects.toEqual(123)
    })
    it('should fail with the provided string', async () => {
      const effect = Effect.fail('foo' as const)
      expectTypeOf(effect).toEqualTypeOf<Effect<never, 'foo', never>>()
      await expect(Effect.runPromise(effect)).rejects.toEqual('foo')
    })
    it('should fail with the provided number', async () => {
      const effect = Effect.fail(true)
      expectTypeOf(effect).toEqualTypeOf<Effect<never, boolean, never>>()
      await expect(Effect.runPromise(effect)).rejects.toEqual(true)
    })
  })
}
