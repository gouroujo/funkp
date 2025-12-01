import type { Effect } from 'src/Effect'
import * as O from 'src/RuntimeOp'
import { effectable } from '../internal/effectable'

export const flatmap = <S1, S2, F2, C2>(
  fn: (value: S1) => Effect<S2, F2, C2>,
): (<F1, C1, C2>(
  effect: Effect<S1, F1, C1>,
) => Effect<S1 extends never ? never : S2, F1 | F2, C1 | C2>) => {
  return (effect) => effectable([...effect.ops, O.onSuccess(fn)])
}
export const chain = flatmap

export const flatmapError = <S2, F1, F2, C2>(
  fn: (value: F1) => Effect<S2, F2, C2>,
): (<S1, C1>(
  effect: Effect<S1, F1, C1>,
) => Effect<S1 | S2, F1 extends never ? never : F2, C1 | C2>) => {
  return (effect) => effectable([...effect.ops, O.onFailure(fn)])
}
export const orElse = flatmapError

if (import.meta.vitest) {
  const { it, expect, describe, expectTypeOf } = import.meta.vitest
  const Effect = await import('src/Effect')
  const pipe = (await import('../../functions/pipe')).pipe

  describe('Effect.flatmap', () => {
    it('should flatmap success values', async () => {
      const effect = pipe(
        Effect.succeed(123),
        Effect.flatmap((v) => Effect.succeed(v + 1)),
      )
      expectTypeOf(effect).toEqualTypeOf<Effect<number, never, never>>()
      await expect(Effect.runPromise(effect)).resolves.toEqual(123 + 1)
    })
    it('should not flatmap fail values', async () => {
      const effect = pipe(
        Effect.fail('error' as const),
        Effect.flatmap((v) => Effect.succeed(v + 1)),
      )
      expectTypeOf(effect).toEqualTypeOf<Effect<never, 'error', never>>()
      await expect(Effect.runPromise(effect)).rejects.toEqual('error')
    })
  })
  describe('Effect.flatmapError', () => {
    it('should flatmap error values', async () => {
      const effect = pipe(
        Effect.fail(123),
        Effect.flatmapError((v) => Effect.fail(v + 1)),
      )
      expectTypeOf(effect).toEqualTypeOf<Effect<never, number, never>>()
      await expect(Effect.runPromise(effect)).rejects.toEqual(123 + 1)
    })
    it('should not flatmap success values', async () => {
      const effect = pipe(
        Effect.succeed('success' as const),
        Effect.flatmapError((v) => Effect.fail(v + 1)),
      )
      expectTypeOf(effect).toEqualTypeOf<Effect<'success', never, never>>()
      await expect(Effect.runPromise(effect)).resolves.toEqual('success')
    })
  })
}
