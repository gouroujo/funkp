import type { Effect } from '..'
import { mapLeft, mapRight } from '../../Either'
import { sync } from '../../RuntimeOp'

export const map = <Success, MappedSucces, Failure, Requirements>(
  fn: (value: Success) => MappedSucces,
): ((
  effect: Effect<Success, Failure, Requirements>,
) => Effect<MappedSucces, Failure, Requirements>) => {
  return (effect) => ({
    *[Symbol.iterator]() {
      return yield sync(mapRight(fn)(yield* effect))
    },
  })
}
export const mapError = <Success, MappedFailure, Failure, Requirements>(
  fn: (value: Failure) => MappedFailure,
): ((
  effect: Effect<Success, Failure, Requirements>,
) => Effect<Success, MappedFailure, Requirements>) => {
  return (effect) => ({
    *[Symbol.iterator]() {
      return yield sync(mapLeft(fn)(yield* effect))
    },
  })
}

if (import.meta.vitest) {
  const { it, expect, describe, expectTypeOf } = import.meta.vitest
  describe('Effect.map', async () => {
    const runPromise = (await import('../run')).runPromise
    const succeed = (await import('../constructors/succeed')).succeed
    const pipe = (await import('../../functions/pipe')).pipe

    it('should map values', async () => {
      const effect = pipe(
        succeed(123),
        map((v) => v + 1),
        map((v) => v * 2),
        map((v) => v - 3),
      )
      expectTypeOf(effect).toEqualTypeOf<Effect<number, never, never>>()
      await expect(runPromise(effect)).resolves.toEqual((123 + 1) * 2 - 3)
    })
    // it('should map values async', async () => {
    //   const effect = pipe(
    //     succeed(123),
    //     map((v) => Promise.resolve(v + 1)),
    //     map(async (v) => await Promise.resolve(v * 2)),
    //     map((v) => v - 3),
    //   )
    //   expectTypeOf(effect).toEqualTypeOf<Effect<number, never, never>>()
    //   const result = await runPromise(effect)
    //   expect(result).toEqual({ _tag: 'Right', right: (123 + 1) * 2 - 3 })
    // })
  })
  describe('Effect.mapError', async () => {
    const runPromise = (await import('../run')).runPromise
    const fail = (await import('../constructors/fail')).fail
    const pipe = (await import('../../functions/pipe')).pipe

    it('should map values', async () => {
      const effect = pipe(
        fail(123),
        mapError((v) => v + 1),
        mapError((v) => v * 2),
        mapError((v) => v - 3),
      )
      expectTypeOf(effect).toEqualTypeOf<Effect<never, number, never>>()
      await expect(runPromise(effect)).rejects.toEqual((123 + 1) * 2 - 3)
    })
  })
}
