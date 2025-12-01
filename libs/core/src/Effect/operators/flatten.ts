import type { Effect } from 'src/Effect'
import * as O from 'src/RuntimeOp'

import { effectable } from '../internal/effectable'

export function flatten() {
  return <S, F1, R1, F2, R2>(
    effect: Effect<Effect<S, F1, R1>, F2, R2>,
  ): Effect<S, F1 | F2, R1 | R2> => {
    return effectable([...effect.ops, O.onSuccess((v) => v)])
  }
}

if (import.meta.vitest) {
  const { it, expect, describe, expectTypeOf } = import.meta.vitest
  const Effect = await import('src/Effect')
  const pipe = (await import('../../functions/pipe')).pipe

  describe('Effect.flatten', () => {
    it('should flatten success values', async () => {
      const effect = pipe(Effect.succeed(Effect.succeed(123)), Effect.flatten())
      expectTypeOf(effect).toEqualTypeOf<Effect<number, never, never>>()
      await expect(Effect.runPromise(effect)).resolves.toEqual(123)
    })
    it('should not flatten fail values', async () => {
      const effect = pipe(
        Effect.succeed(Effect.fail('error' as const)),
        Effect.flatten(),
      )
      expectTypeOf(effect).toEqualTypeOf<Effect<never, 'error', never>>()
      await expect(Effect.runPromise(effect)).rejects.toEqual('error')
    })
  })
}
