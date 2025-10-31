import * as Exit from '../../Exit'
import * as RuntimeFiber from '../../RuntimeFiber'
import * as Op from '../../RuntimeOp'
import { AsyncFunction } from '../../utils/function/types'
import { promise, succeed } from '../constructors'
import { fork } from '../operators'

import {
  type Effect,
  type Failure,
  type Requirements,
  type Success,
} from '../types'
import { concurrency, type Concurrency } from './concurrency'
import { semaphore } from './semaphore'

type Options = {
  concurrency?: Concurrency
}
type SuccessMap<E extends Effect<unknown, unknown, unknown>[]> = {
  [I in keyof E]: Success<E[I]>
}
type Union<T extends unknown[]> = T[number]

export function all<E extends Effect<unknown, unknown, unknown>[]>(
  effects: [...E],
  options?: Options,
): Effect<SuccessMap<E>, Failure<Union<E>>, Requirements<Union<E>>> {
  return {
    *[Symbol.iterator]() {
      const tasks: AsyncFunction[] = []
      const runtime = yield Op.withRuntime()
      for (const effect of effects) {
        const fiber = yield* fork(effect)
        tasks.push(async () => {
          RuntimeFiber.runLoop(fiber, runtime)
          const exit = await RuntimeFiber.await(fiber)
          return Exit.isSuccess(exit)
            ? exit.success
            : Promise.reject(exit.failure)
        })
      }
      const result = yield Op.promise(
        semaphore(concurrency(options?.concurrency))(tasks),
      )
      return result
    },
  }
}

if (import.meta.vitest) {
  const { describe, it, expect, expectTypeOf } = import.meta.vitest
  const makeAsyncEffect = <T>(n: T, delay: number) =>
    promise(
      () =>
        new Promise<T>((resolve) => {
          setTimeout(() => {
            resolve(n)
          }, delay)
        }),
    )

  describe('Effect.all', async () => {
    const { runPromise } = await import('../run')
    it('should combine sync effect run concurrently', async () => {
      const numbered = all(
        [succeed('a' as const), succeed('b' as const), succeed('c' as const)],
        {
          concurrency: 2,
        },
      )
      expectTypeOf(numbered).toEqualTypeOf<
        Effect<['a', 'b', 'c'], never, never>
      >()
      const result = await runPromise(numbered)
      expect(result).toEqual(['a', 'b', 'c'])
    })
    it('should combine async effect run concurrently', async () => {
      const task1 = makeAsyncEffect('a' as const, 2)
      const task2 = makeAsyncEffect('b' as const, 10)
      const task3 = makeAsyncEffect('c' as const, 1)

      const numbered = all([task1, task2, task3], {
        concurrency: 2,
      })
      expectTypeOf(numbered).toEqualTypeOf<
        Effect<['a', 'b', 'c'], never, never>
      >()
      const result = await runPromise(numbered)
      expect(result).toEqual(['a', 'b', 'c'])
    })
  })
}
