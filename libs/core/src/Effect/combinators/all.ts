// import { Context, Effect, Error, Success } from '.'
// import { gen } from './gen'
// import { promise } from './promise'

import { chan, put, take } from '../../Channel'
import { isLeft, isRight, right } from '../../Either'
import { gen, promise } from '../constructors'
import {
  type Effect,
  type Failure,
  type Requirements,
  type Success,
} from '../types'
import { concurrency, type Concurrency } from './concurrency'

type Options = {
  concurrency?: Concurrency
}
type SuccessMap<E extends Effect<unknown, unknown, unknown>[]> = {
  [I in keyof E]: Success<E[I]>
}
type Union<T extends unknown[]> = T[number]

export function all<E extends Effect<any, any, any>[]>(
  effects: [...E],
  options?: Options,
): Effect<SuccessMap<E>, Failure<Union<E>>, Requirements<Union<E>>> {
  const semaphore = chan<void>(concurrency(options?.concurrency))
  return gen(function* () {
    const results = [] as SuccessMap<E>
    for (let index = 0; index < effects.length; index++) {
      yield* (function* () {
        yield put(semaphore)
        const result = yield* effects[index]
        if (isLeft(result)) {
          return result as Failure<Union<E>>
        } else if (isRight(result)) results.push(result.right)
        yield take(semaphore)
      })()
    }
    return right(results)
  })
}

if (import.meta.vitest) {
  const { describe, it, expect, expectTypeOf } = import.meta.vitest

  // Helper function to simulate a task with a delay
  const makeTask = <T>(n: T, delay: number) =>
    promise(
      () =>
        new Promise<T>((resolve) => {
          console.log(`start task ${n}`) // Logs when the task starts
          setTimeout(() => {
            console.log(`task ${n} done`) // Logs when the task finishes
            resolve(n)
          }, delay)
        }),
    )

  describe('Effect.all', async () => {
    const { runPromise } = await import('../run')

    it('should sequentially order effect', async () => {
      const task1 = makeTask('a' as const, 200)
      const task2 = makeTask('b' as const, 100)
      const task3 = makeTask('c' as const, 210)

      const numbered = all([task1, task2, task3], {
        concurrency: 2,
      })
      expectTypeOf(numbered).toEqualTypeOf<
        Effect<['a', 'b', 'c'], never, never>
      >()
      const result = await runPromise(numbered)
      expect(result).toEqualRight(['a', 'b', 'c'])
    })
  })
}
