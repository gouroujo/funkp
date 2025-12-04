import type { Context, Effect, Failure, Success } from 'src/Effect'
import { map } from 'src/Effect/operators/map'
import * as O from 'src/RuntimeOp'
import { effectable } from '../internal/effectable'
import { concurrency, type Concurrency } from './concurrency'

type Options = {
  concurrency?: Concurrency
}
type SuccessMap<E extends Effect<unknown, unknown, unknown>[]> = {
  [I in keyof E]: Success<E[I]>
}
type Union<T extends unknown[]> = T[number]

export const all = <E extends Effect<unknown, unknown, unknown>[]>(
  effects: [...E],
  options?: Options,
): Effect<SuccessMap<E>, Failure<Union<E>>, Context<Union<E>>> => {
  return effectable([O.parallel(effects, concurrency(options?.concurrency))])
}

export const allWith = <E extends Effect<unknown, unknown, unknown>[], Out>(
  effects: [...E],
  fn: (arg: SuccessMap<E>) => Out,
  options?: Options,
): Effect<Out, Failure<Union<E>>, Context<Union<E>>> => {
  return map<SuccessMap<E>, Out, Failure<Union<E>>, Context<Union<E>>>(fn)(
    all(effects, options),
  )
}

if (import.meta.vitest) {
  const { describe, it, expect, expectTypeOf, vi } = import.meta.vitest
  const Effect = await import('src/Effect')

  describe('Effect.all', async () => {
    it('should combine sync effect run concurrently', async () => {
      const effect = Effect.all(
        [
          Effect.succeed('a' as const),
          Effect.succeed('b' as const),
          Effect.succeed('c' as const),
        ],
        {
          concurrency: 2,
        },
      )
      expectTypeOf(effect).toEqualTypeOf<
        Effect<['a', 'b', 'c'], never, never>
      >()
      await expect(Effect.runPromise(effect)).resolves.toEqual(['a', 'b', 'c'])
    })
    it('should combine sync effect and stop if one fail', async () => {
      const effect = Effect.all(
        [
          Effect.succeed('a' as const),
          Effect.fail('fail' as const),
          Effect.succeed('c' as const),
        ],
        {
          concurrency: 2,
        },
      )
      expectTypeOf(effect).toEqualTypeOf<
        Effect<['a', never, 'c'], 'fail', never>
      >()
      await expect(Effect.runPromise(effect)).rejects.toEqual('fail')
    })
    it('should combine async effect run concurrently', async ({
      onTestFinished,
    }) => {
      // vi.useFakeTimers()
      // onTestFinished(() => void vi.useRealTimers()) // Reset timers even if the test fail
      const mock = vi.fn()
      const effect = Effect.all(
        [Effect.sleep(150), Effect.sleep(200), Effect.sleep(10)],
        {
          concurrency: 2,
        },
      )
      const start = Date.now()
      await Effect.runPromise(effect).then(mock)
      // await vi.runAllTimersAsync()
      expect(mock).toHaveBeenCalled()
      console.log(Date.now() - start)
      expect(Date.now() - start).toBeLessThanOrEqual(210)
    })
  })

  describe('Effect.allWith', () => {
    it('should combine sync effect and map the result', async () => {
      const effect = Effect.allWith(
        [
          Effect.succeed('a' as const),
          Effect.succeed('b' as const),
          Effect.succeed('c' as const),
        ],
        ([a, b, c]) => `${a}-${b}-${c}` as const,
      )
      expectTypeOf(effect).toEqualTypeOf<Effect<'a-b-c', never, never>>()
      await expect(Effect.runPromise(effect)).resolves.toEqual('a-b-c')
    })
  })
}
