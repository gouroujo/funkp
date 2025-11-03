import * as Exit from '../../Exit'
import * as RuntimeFiber from '../../RuntimeFiber'
import * as Op from '../../RuntimeOp'
import { fork, map } from '../operators'

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
  options?: Options,
): Effect<
  [Success<A>, Success<B>],
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
        return yield Op.promise(
          Promise.all(promises).then((exits) =>
            exits.map((exit) => {
              if (Exit.isSuccess(exit)) {
                return exit.success
              }
              throw exit.failure
            }),
          ),
        )
      } catch (error) {
        throw yield Op.fail(error as Failure<A> | Failure<B>)
      }
    },
  }
}

export function zipWith<
  A extends Effect<unknown, unknown, unknown>,
  B extends Effect<unknown, unknown, unknown>,
  T,
>(
  a: A,
  b: B,
  fn: (arg: [Success<A>, Success<B>]) => T,
  options?: Options,
): Effect<T, Failure<A> | Failure<B>, Requirements<A> | Requirements<B>> {
  return map(fn)(zip(a, b, options))
}

if (import.meta.vitest) {
  const { describe, it, expect, expectTypeOf } = import.meta.vitest
  const Effect = await import('src/Effect')
  describe('Effect.zip', async () => {
    it('zips two successful effects into a tuple', async () => {
      const a = Effect.succeed(1)
      const b = Effect.succeed('two')
      const z = Effect.zip(a, b)
      expectTypeOf(z).toEqualTypeOf<Effect<[number, string], never, never>>()
      await expect(Effect.runPromise(z)).resolves.toEqual([1, 'two'])
    })

    it('propagates failure from either effect', async () => {
      const a = Effect.succeed(1)
      const b = Effect.fail('err')
      const z = Effect.zip(a, b)
      await expect(Effect.runPromise(z)).rejects.toEqual('err')
    })
  })

  describe('Effect.zipWith', async () => {
    it('zips two successful effects and merge them', async () => {
      const a = Effect.succeed(1 as const)
      const b = Effect.succeed('two' as const)
      const z = Effect.zipWith(a, b, ([a, b]) => `${a}-${b}` as const)
      expectTypeOf(z).toEqualTypeOf<Effect<'1-two', never, never>>()
      await expect(Effect.runPromise(z)).resolves.toEqual('1-two')
    })

    it('propagates failure from either effect', async () => {
      const a = Effect.succeed(1)
      const b = Effect.fail('err')
      const z = Effect.zipWith(a, b, ([a, b]) => `${a}-${b}`)
      await expect(Effect.runPromise(z)).rejects.toEqual('err')
    })
  })
}
