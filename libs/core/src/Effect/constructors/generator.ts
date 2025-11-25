import { iterate } from 'src/RuntimeOp'
import type { Effect } from '../effect'
import { effectable } from '../internal/effectable'
import { YieldWrap } from '../internal/yieldwrap'

type ExtractFailure<T> = [T] extends [never]
  ? never
  : [T] extends [YieldWrap<Effect<any, infer U, any>>]
    ? U
    : never

export function gen<
  YieldingValues extends YieldWrap<Effect<any, any, any>>,
  Success,
>(
  genFn: () => Generator<YieldingValues, Success, any>,
): Effect<Success, ExtractFailure<YieldingValues>, never> {
  return effectable([iterate(genFn)])
}

if (import.meta.vitest) {
  const { describe, it, expect, expectTypeOf, vi } = import.meta.vitest

  describe('Effect.gen', async () => {
    const Effect = await import('../')
    const { pipe } = await import('../../functions')

    const effect1 = Effect.succeed('effect1' as const)
    const effect2 = Effect.succeed('effect2' as const)
    const failure = Effect.fail('fail' as const)
    it('should return an effect', async () => {
      // eslint-disable-next-line require-yield
      const combined = gen(function* () {
        return 'hello' as const
      })
      expectTypeOf(combined).toEqualTypeOf<Effect<'hello', never, never>>()
      await expect(Effect.runPromise(combined)).resolves.toEqual('hello')
    })
    it('should resolve a other effect and return', async () => {
      const combined = gen(function* () {
        const a = yield* effect1
        return a
      })
      expectTypeOf(combined).toEqualTypeOf<Effect<'effect1', never, never>>()
      await expect(Effect.runPromise(combined)).resolves.toEqual('effect1')
    })
    it('should combine effect', async () => {
      const combined = gen(function* () {
        const a = yield* effect1
        const b = yield* effect2
        console.log(a, b)
        return [a, b] as const
      })

      expectTypeOf(combined).toEqualTypeOf<
        Effect<readonly ['effect1', 'effect2'], never, never>
      >()
      await expect(Effect.runPromise(combined)).resolves.toEqual([
        'effect1',
        'effect2',
      ])
    })
    it('should gen with a failure', async () => {
      const effect = gen(function* () {
        throw yield* failure
      })
      expectTypeOf(effect).toEqualTypeOf<Effect<never, 'fail', never>>()
      await expect(Effect.runPromise(effect)).rejects.toEqual('fail')
    })
    it('should gen effect that could fail', async () => {
      const spy = vi.fn()
      const effect = gen(function* () {
        const a = yield* failure
        spy(a)
        const b = yield* effect2
        return b
      })
      expectTypeOf(effect).toEqualTypeOf<Effect<'effect2', 'fail', never>>()
      await expect(Effect.runPromise(effect)).rejects.toEqual('fail')
      expect(spy).not.toHaveBeenCalled()
    })
    it('should handle failure', async () => {
      const effect = gen(function* () {
        // eslint-disable-next-line @typescript-eslint/no-inferrable-types
        const valid: boolean = true
        const a = yield* effect1
        if (valid) {
          throw yield* failure
        }
        return a
      })
      expectTypeOf(effect).toEqualTypeOf<Effect<'effect1', 'fail', never>>()
      await expect(Effect.runPromise(effect)).rejects.toEqual('fail')
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
