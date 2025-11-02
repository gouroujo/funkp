import { type Effect } from 'src/Effect'
import { fail, Operation, pure } from 'src/RuntimeOp'

export const map = <S1, S2>(
  fn: (value: S1) => S2,
): (<F, C>(
  effect: Effect<S1, F, C>,
) => Effect<S1 extends never ? never : S2, F, C>) => {
  return (effect) => ({
    *[Symbol.iterator]() {
      return yield pure(fn(yield* effect))
    },
  })
}

export const mapError = <F1, F2>(
  fn: (value: F1) => F2,
): (<S, C>(
  effect: Effect<S, F1, C>,
) => Effect<S, F1 extends never ? never : F2, C>) => {
  return (effect) => ({
    *[Symbol.iterator]() {
      try {
        return yield pure(yield* effect) as Operation<any>
      } catch (failure) {
        throw yield fail(fn(failure as F1)) as Operation<F2>
      }
    },
  })
}

if (import.meta.vitest) {
  const { it, expect, describe, expectTypeOf } = import.meta.vitest
  describe('Effect.map', async () => {
    const Effect = await import('..')
    const pipe = (await import('../../functions/pipe')).pipe

    it('should map values', async () => {
      const effect = pipe(
        Effect.succeed(123),
        Effect.map((v) => v + 1),
        Effect.mapError((v) => v + 100),
        Effect.map((v) => v * 2),
        Effect.map((v) => v - 3),
      )
      expectTypeOf(effect).toEqualTypeOf<Effect<number, never, never>>()
      await expect(Effect.runPromise(effect)).resolves.toEqual(
        (123 + 1) * 2 - 3,
      )
    })
    it('should not map failures', async () => {
      const effect = pipe(
        Effect.fail('error' as const),
        Effect.map((v) => v + 1),
        Effect.mapError((v) => `${v}!` as const),
        Effect.map((v) => v * 2),
        Effect.map((v) => v - 3),
      )
      expectTypeOf(effect).toEqualTypeOf<Effect<never, 'error!', never>>()
      await expect(Effect.runPromise(effect)).rejects.toEqual('error!')
    })
  })

  describe('Effect.mapError', async () => {
    const Effect = await import('..')
    const pipe = (await import('../../functions/pipe')).pipe

    it('should map failure', async () => {
      const effect = pipe(
        Effect.fail(123),
        Effect.mapError((v) => v + 1),
        Effect.map((v) => v + 100),
        Effect.mapError((v) => v * 2),
        Effect.mapError((v) => v - 3),
      )
      expectTypeOf(effect).toEqualTypeOf<Effect<never, number, never>>()
      await expect(Effect.runPromise(effect)).rejects.toEqual((123 + 1) * 2 - 3)
    })
    it('should not map success', async () => {
      const effect = pipe(
        Effect.succeed(123),
        Effect.mapError((v) => v + 1),
        Effect.map((v) => v + 100),
        Effect.mapError((v) => v * 2),
        Effect.mapError((v) => v - 3),
      )
      expectTypeOf(effect).toEqualTypeOf<Effect<number, never, never>>()
      await expect(Effect.runPromise(effect)).resolves.toEqual(123 + 100)
    })
  })
}
