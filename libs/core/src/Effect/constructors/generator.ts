import type { FilterRequirement, ServiceType } from '../../Context'
import type { Either } from '../../Either'
import { Instruction } from '../../Fiber/instructions'
import type { Effect } from '../types'

export function gen<
  Success,
  Failure = never,
  YieldingValues extends ServiceType | Instruction = never,
>(
  genFn: () => Generator<YieldingValues, Either<Failure, Success>, any>,
): Effect<Success, Failure, FilterRequirement<YieldingValues>> {
  return {
    *[Symbol.iterator]() {
      return yield* genFn() as any
    },
  }
}

if (import.meta.vitest) {
  const { describe, it, expect, expectTypeOf } = import.meta.vitest

  describe('Effect.gen', async () => {
    const { map } = await import('../operators')
    const { succeed, fail } = await import('.')
    const { runPromise } = await import('../run')
    const { pipe } = await import('../../functions')
    const E = await import('../../Either')

    const effect1 = succeed('effect1' as const)
    const effect2 = succeed('effect2' as const)
    const failure = fail('fail' as const)

    it('should combine effect', async () => {
      const combined = pipe(
        gen(function* () {
          const a = yield* effect1
          const b = yield* effect2
          return E.all([a, b])
        }),
        map(([a, b]) => `Combined: ${a}, ${b}` as const),
        map((a) => a),
      )
      expectTypeOf(combined).toEqualTypeOf<
        Effect<'Combined: effect1, effect2', never, never>
      >()
      const result = await runPromise(combined)
      expect(result).toEqualRight('Combined: effect1, effect2')
    })
    it('should combine effect that fail', async () => {
      const combined = pipe(
        gen(function* () {
          const a = yield* failure
          const b = yield* effect2
          return E.all([a, b])
        }),
        map(([a, b]) => `Combined: ${a}, ${b}` as const),
        map((a) => a),
      )

      expectTypeOf(combined).toEqualTypeOf<Effect<never, 'fail', never>>()
      const result = await runPromise(combined)
      expect(result).toEqualLeft('fail')
    })

    it('should combine with async effect', async () => {
      const { promise } = await import('./async')
      const asyncEffect = promise(() => Promise.resolve('async part' as const))
      const effect = pipe(
        gen(function* () {
          const syncResult = yield* effect1
          const asyncResult = yield* asyncEffect
          return E.all([syncResult, asyncResult])
        }),
        map(([a, b]) => `Combined: ${a}, ${b}` as const),
        map((a) => a),
      )
      const result = await runPromise(effect)
      expect(result).toEqualRight('Combined: effect1, async part')
    })
  })
}
