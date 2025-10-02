import { type Instruction, put } from '../../Channel'
import type { FilterRequirement, Requirement } from '../../Context'
import type { Either } from '../../Either'
import type { Effect } from '../types'

export function gen<
  Success,
  Failure = never,
  YieldingValues extends Instruction | Requirement = never,
>(
  genFn: () => Generator<YieldingValues, Either<Failure, Success>, any>,
): Effect<Success, Failure, FilterRequirement<YieldingValues>> {
  return {
    *[Symbol.iterator]() {
      return yield put(yield* genFn() as any)
    },
  }
}

if (import.meta.vitest) {
  const { describe, it, expect, expectTypeOf } = import.meta.vitest

  describe('Effect.gen', async () => {
    const { map } = await import('../operators')
    const { runPromise } = await import('../run')
    const { pipe } = await import('../../functions')
    const E = await import('../../Either')

    // eslint-disable-next-line require-yield
    const effect1 = gen<'effect1'>(function* () {
      return E.right('effect1' as const)
    })
    // eslint-disable-next-line require-yield
    const effect2 = gen<'effect2'>(function* () {
      return E.right('effect2' as const)
    })
    // eslint-disable-next-line require-yield
    const failure = gen<never, 'fail'>(function* () {
      return E.left('fail' as const)
    })

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
