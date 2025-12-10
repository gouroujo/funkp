import { iterate } from 'src/RuntimeOp'
import type { Effect } from '../effect'
import { effectable } from '../internal/effectable'
import { YieldWrap } from '../internal/yieldwrap'

type ExtractFailure<T> = [T] extends [never]
  ? never
  : [T] extends [YieldWrap<Effect<unknown, infer U, unknown>>]
    ? U
    : never

type ExtractContext<T> = [T] extends [never]
  ? never
  : [T] extends [YieldWrap<Effect<unknown, unknown, infer C>>]
    ? C
    : never

export function gen<
  YieldingValues extends YieldWrap<Effect<unknown, unknown, unknown>>,
  Success,
>(
  genFn: () => Generator<YieldingValues, Success>,
): Effect<
  Success,
  ExtractFailure<YieldingValues>,
  ExtractContext<YieldingValues>
> {
  return effectable([iterate(genFn)])
}

if (import.meta.vitest) {
  const { describe, it, expect, expectTypeOf, vi } = import.meta.vitest
  const Effect = await import('src/Effect')

  describe('Effect.gen', () => {
    it('should extract correct type', () => {
      const effect1: Effect<number, 'err', 'aaa'> = Effect.succeed(42)
      const effect2: Effect<number, 'err2', 'bbb'> = Effect.succeed(24)
      const program = Effect.gen(function* () {
        yield* effect2
        return yield* effect1
      })
      expectTypeOf(program).toEqualTypeOf<
        Effect<number, 'err' | 'err2', 'aaa' | 'bbb'>
      >()
    })
    it.each([
      'hello' as const,
      null,
      undefined,
      false,
      true,
      0,
      -1,
      { foo: 'bar' },
      [1, 2, 3],
    ])('should return an effect with value %s', async (t) => {
      // eslint-disable-next-line require-yield
      const combined = Effect.gen(function* () {
        return t
      })
      expectTypeOf(combined).toEqualTypeOf<Effect<typeof t, never, never>>()
      await expect(Effect.runPromise(combined)).resolves.toEqual(t)
    })
    it.each([
      'hello' as const,
      null,
      undefined,
      false,
      true,
      0,
      -1,
      { foo: 'bar' },
      [1, 2, 3],
    ])('should resolve an other effect and return', async (t) => {
      const spy = vi.fn()
      const subEffect = Effect.succeed(t)
      const combined = Effect.gen(function* () {
        const a = yield* subEffect
        spy(a)
        return a
      })
      expectTypeOf(combined).toEqualTypeOf<Effect<typeof t, never, never>>()
      await expect(Effect.runPromise(combined)).resolves.toEqual(t)
      expect(spy).toHaveBeenCalledWith(t)
    })
    it('should combine two effects together', async () => {
      const effect1 = Effect.succeed('effect1' as const)
      const effect2 = Effect.succeed('effect2' as const)
      const combined = Effect.gen(function* () {
        const a = yield* effect1
        const b = yield* effect2
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
    it('should return an effect with a failure', async () => {
      const failure = Effect.fail('fail' as const)
      const effect = Effect.gen(function* () {
        throw yield* failure
      })
      expectTypeOf(effect).toEqualTypeOf<Effect<never, 'fail', never>>()
      await expect(Effect.runPromise(effect)).rejects.toEqual('fail')
    })
    it('should stop the execution of an effect that failed', async () => {
      const effect2 = Effect.succeed('effect2' as const)
      const failure = Effect.fail('fail' as const)
      const spy = vi.fn()
      const effect = Effect.gen(function* () {
        const a = yield* failure
        spy(a)
        const b = yield* effect2
        return b
      })
      expectTypeOf(effect).toEqualTypeOf<Effect<'effect2', 'fail', never>>()
      await expect(Effect.runPromise(effect)).rejects.toEqual('fail')
      expect(spy).not.toHaveBeenCalled()
    })
    it('should return an effect with a potential failure', async () => {
      const effect1 = Effect.succeed('effect1' as const)
      const failure = Effect.fail('fail' as const)
      const effect = Effect.gen(function* () {
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

    it('should combine a sync effect with an async effect', async () => {
      const effect1 = Effect.succeed('effect1' as const)
      const asyncEffect = Effect.promise(() =>
        Promise.resolve('async part' as const),
      )
      const effect = Effect.gen(function* () {
        const syncResult = yield* effect1
        const asyncResult = yield* asyncEffect
        return [syncResult, asyncResult] as const
      })
      await expect(Effect.runPromise(effect)).resolves.toEqual([
        'effect1',
        'async part',
      ])
    })
  })
}
