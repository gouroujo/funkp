import type { FilterRequirement, ServiceType } from '../../Context'
import type { Operation } from '../../RuntimeOp'
import type { Effect } from '../types'

export function gen<
  Success,
  Failure = never,
  YieldingValues extends ServiceType | Operation = never,
>(
  genFn: () => Generator<YieldingValues, Success, unknown>,
): Effect<Success, Failure, FilterRequirement<YieldingValues>> {
  return {
    *[Symbol.iterator]() {
      return yield* genFn()
    },
  }
}

if (import.meta.vitest) {
  const { describe, it, expect, expectTypeOf, vi } = import.meta.vitest

  describe('Effect.gen', async () => {
    const Effect = await import('../')
    const { pipe } = await import('../../functions')

    const effect1 = Effect.succeed('effect1' as const)
    const effect2 = Effect.succeed('effect2' as const)
    const failure = Effect.fail('fail' as const)

    it('should combine effect', async () => {
      const combined = pipe(
        gen(function* () {
          const a = yield* effect1
          const b = yield* effect2
          return [a, b] as const
        }),
        Effect.map(([a, b]) => `Combined: ${a}, ${b}` as const),
      )
      expectTypeOf(combined).toEqualTypeOf<
        Effect<'Combined: effect1, effect2', never, never>
      >()
      const result = await Effect.runPromise(combined)
      expect(result).toEqual('Combined: effect1, effect2')
    })
    it('should combine effect that fail', async () => {
      const spy = vi.fn()
      const combined = pipe(
        gen(function* () {
          const a = yield* failure
          spy(a)
          const b = yield* effect2
          return [a, b] as const
        }),
        Effect.map(([a, b]) => `Combined: ${a}, ${b}` as const),
      )
      expectTypeOf(combined).toEqualTypeOf<Effect<never, 'fail', never>>()
      await expect(Effect.runPromise(combined)).rejects.toEqual('fail')
      expect(spy).not.toHaveBeenCalled()
    })

    it('should combine with async effect', async () => {
      const { promise } = await import('./async')
      const asyncEffect = promise(() => Promise.resolve('async part' as const))
      const effect = pipe(
        gen(function* () {
          const syncResult = yield* effect1
          const asyncResult = yield* asyncEffect
          return [syncResult, asyncResult] as const
        }),
        Effect.map(([a, b]) => `Combined: ${a}, ${b}` as const),
      )
      const result = await Effect.runPromise(effect)
      expect(result).toEqual('Combined: effect1, async part')
    })
  })
}
