import * as Exit from '../../Exit'
import * as RuntimeFiber from '../../RuntimeFiber'
import * as Op from '../../RuntimeOp'
import { fork } from '../operators'

import {
  type Effect,
  type Failure,
  type Requirements,
  type Success,
} from '../types'

type Options = {
  concurrent?: boolean
}

export function zip<
  A extends Effect<unknown, unknown, unknown>,
  B extends Effect<unknown, unknown, unknown>,
>(
  a: A,
  b: B,
): Effect<
  [Success<A>, Success<B>],
  Failure<A> | Failure<B>,
  Requirements<A> | Requirements<B>
> {
  return zipWith(a, b, (a, b) => [a, b] as [Success<A>, Success<B>])
}

export function zipWith<
  A extends Effect<unknown, unknown, unknown>,
  B extends Effect<unknown, unknown, unknown>,
  Fn extends (a: Success<A>, b: Success<B>) => unknown,
>(
  a: A,
  b: B,
  fn: Fn,
  options?: Options,
): Effect<
  ReturnType<Fn>,
  Failure<A> | Failure<B>,
  Requirements<A> | Requirements<B>
> {
  return {
    *[Symbol.iterator]() {
      const promises: Promise<
        Exit.Exit<Success<A> | Success<B>, Failure<A> | Failure<B>>
      >[] = []
      for (const effect of [a, b]) {
        const fiber = yield* fork(effect)
        const i = promises.push(RuntimeFiber.await(fiber))
        if (options?.concurrent !== true) {
          yield Op.promise(promises[i - 1])
        }
      }
      try {
        const result: [Success<A>, Success<B>] = yield Op.promise(
          Promise.all(promises).then((exits) =>
            exits.map((exit) => {
              if (Exit.isSuccess(exit)) {
                return exit.success
              }
              throw exit.failure
            }),
          ),
        )
        return fn(...result) as ReturnType<Fn>
      } catch (error) {
        throw yield Op.fail(error as Failure<A> | Failure<B>)
      }
    },
  }
}

if (import.meta.vitest) {
  const { describe, it, expect, expectTypeOf } = import.meta.vitest
  describe('Effect.zip', async () => {
    const runPromise = (await import('../run')).runPromise
    const { succeed } = await import('../constructors/succeed')
    const { fail } = await import('../constructors/fail')

    it('zips two successful effects into a tuple', async () => {
      const a = succeed(1)
      const b = succeed('two')
      const z = zip(a, b)
      expectTypeOf(z).toEqualTypeOf<Effect<[number, string], never, never>>()
      await expect(runPromise(z)).resolves.toEqual([1, 'two'])
    })

    it('propagates failure from either effect', async () => {
      const a = succeed(1)
      const b = fail('err')
      const z = zip(a, b)
      await expect(runPromise(z)).rejects.toEqual('err')
    })
  })

  describe('Effect.zipWith', async () => {
    const runPromise = (await import('../run')).runPromise
    const { succeed } = await import('../constructors/succeed')
    const { fail } = await import('../constructors/fail')

    it('zips two successful effects and merge them', async () => {
      const a = succeed(1)
      const b = succeed('two')
      const z = zipWith(a, b, (a, b) => `${a}-${b}`)
      expectTypeOf(z).toEqualTypeOf<Effect<string, never, never>>()
      await expect(runPromise(z)).resolves.toEqual('1-two')
    })

    it('propagates failure from either effect', async () => {
      const a = succeed(1)
      const b = fail('err')
      const z = zip(a, b)
      await expect(runPromise(z)).rejects.toEqual('err')
    })
  })
}
