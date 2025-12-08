import { type Effect, fail, succeed } from 'src/Effect'
import * as O from 'src/RuntimeOp'
import { effectable } from '../internal/effectable'

export const map = <S1, S2, F, C>(
  fn: (value: S1) => S2,
): ((
  effect: Effect<S1, F, C>,
) => Effect<S1 extends never ? never : Awaited<S2>, F, C>) => {
  return (effect) =>
    effectable([...effect.ops, O.onSuccess((v: S1) => succeed(fn(v)))])
}
export const mapSuccess = map

export const mapError = <F1, F2>(
  fn: (value: F1) => F2,
): (<S, C>(
  effect: Effect<S, F1, C>,
) => Effect<S, F1 extends never ? never : F2, C>) => {
  return (effect) =>
    effectable([...effect.ops, O.onFailure((v: F1) => fail(fn(v)))])
}

if (import.meta.vitest) {
  const { it, expect, describe, expectTypeOf } = import.meta.vitest
  describe('Effect.map', async () => {
    const Effect = await import('src/Effect')
    const { pipe } = await import('src/functions/pipe')

    it('should map one value', async () => {
      const effect = pipe(
        Effect.succeed(123),
        Effect.map((v) => v + 1),
      )
      expectTypeOf(effect).toEqualTypeOf<Effect<number, never, never>>()
      await expect(Effect.runPromise(effect)).resolves.toEqual(123 + 1)
    })

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

    it('should map types', async () => {
      const effect = pipe(
        Effect.succeed('abc' as const),
        Effect.map((v) => v.toUpperCase() as Uppercase<typeof v>),
        Effect.map((v) => `${v}!` as const),
      )
      expectTypeOf(effect).toEqualTypeOf<Effect<'ABC!', never, never>>()
      await expect(Effect.runPromise(effect)).resolves.toEqual('ABC!')
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
    it('should map failure types', async () => {
      const effect = pipe(
        Effect.fail('abc' as const),
        Effect.mapError((v) => v.toUpperCase() as Uppercase<typeof v>),
        Effect.mapError((v) => `${v}!` as const),
      )
      expectTypeOf(effect).toEqualTypeOf<Effect<never, 'ABC!', never>>()
      await expect(Effect.runPromise(effect)).rejects.toEqual('ABC!')
    })
  })
}
