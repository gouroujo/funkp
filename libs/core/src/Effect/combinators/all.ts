import * as Exit from 'src/Exit'
import * as RuntimeFiber from 'src/RuntimeFiber'
import * as Op from 'src/RuntimeOp'

import { AsyncFunction } from 'src/utils/function/types'
import { fork, map } from '../operators'

import {
  type Effect,
  type Failure,
  type Requirements,
  type Success,
} from '../effect'
import { concurrency, type Concurrency } from './concurrency'
import { semaphore } from './semaphore'

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
): Effect<SuccessMap<E>, Failure<Union<E>>, Requirements<Union<E>>> => {
  return {
    *[Symbol.iterator]() {
      const tasks: AsyncFunction[] = []
      for (const effect of effects) {
        const fiber = yield* fork(effect)
        tasks.push(async () => RuntimeFiber.await(fiber))
      }
      try {
        return yield Op.promise(
          semaphore(concurrency(options?.concurrency))(tasks).then((exits) => {
            return exits.map((exit) => {
              if (Exit.isSuccess(exit)) {
                return exit.success
              }
              throw exit.failure
            })
          }),
        )
      } catch (error) {
        throw yield Op.fail(error as Failure<Union<E>>)
      }
    },
  }
}

export const allWith = <E extends Effect<unknown, unknown, unknown>[], Out>(
  effects: [...E],
  fn: (arg: SuccessMap<E>) => Out,
  options?: Options,
): Effect<Out, Failure<Union<E>>, Requirements<Union<E>>> => {
  return map(fn)(all(effects, options))
}

if (import.meta.vitest) {
  const { describe, it, expect, expectTypeOf } = import.meta.vitest
  const Effect = await import('src/Effect')
  const makeAsyncEffect = <T>(n: T, delay: number) =>
    Effect.promise(
      () =>
        new Promise<T>((resolve) => {
          setTimeout(() => {
            resolve(n)
          }, delay)
        }),
    )

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
    it('should combine async effect run concurrently', async () => {
      const task1 = makeAsyncEffect('a' as const, 2)
      const task2 = makeAsyncEffect('b' as const, 10)
      const task3 = makeAsyncEffect('c' as const, 1)

      const effect = Effect.all([task1, task2, task3], {
        concurrency: 2,
      })
      expectTypeOf(effect).toEqualTypeOf<
        Effect<['a', 'b', 'c'], never, never>
      >()
      await expect(Effect.runPromise(effect)).resolves.toEqual(['a', 'b', 'c'])
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
