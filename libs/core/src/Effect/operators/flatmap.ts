import type { Effect } from 'src/Effect'

export const flatmap = <S1, S2, F2, C2>(
  fn: (value: S1) => Effect<S2, F2, C2>,
): (<F1, C1, C2>(
  effect: Effect<S1, F1, C1>,
) => Effect<S1 extends never ? never : S2, F1 | F2, C1 | C2>) => {
  return (effect) => ({
    *[Symbol.iterator]() {
      return yield* fn(yield* effect) as any
    },
  })
}
export const chain = flatmap

if (import.meta.vitest) {
  const { it, expect, describe, expectTypeOf } = import.meta.vitest
  describe('Effect.flatmap', async () => {
    const runPromise = (await import('../run')).runPromise
    const succeed = (await import('../constructors/succeed')).succeed
    const fail = (await import('../constructors/fail')).fail

    const pipe = (await import('../../functions/pipe')).pipe

    it('should flatmap success values', async () => {
      const effect = pipe(
        succeed(123),
        flatmap((v) => succeed(v + 1)),
      )
      expectTypeOf(effect).toEqualTypeOf<Effect<number, never, never>>()
      await expect(runPromise(effect)).resolves.toEqual(123 + 1)
    })
    it('should not flatmap fail values', async () => {
      const effect = pipe(
        fail('error' as const),
        flatmap((v) => succeed(v + 1)),
      )
      expectTypeOf(effect).toEqualTypeOf<Effect<never, 'error', never>>()
      await expect(runPromise(effect)).rejects.toEqual('error')
    })
  })
}
