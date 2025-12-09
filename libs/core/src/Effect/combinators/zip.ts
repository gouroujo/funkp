import * as O from 'src/RuntimeOp'
import { map } from '../operators'

import {
  type Context,
  type Effect,
  type Failure,
  type Success,
} from '../effect'
import { effectable } from '../internal/effectable'

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
  Context<A> | Context<B>
> {
  if (options?.concurrent) {
    return effectable([O.parallel([a, b], 1)])
  }
  return effectable([O.parallel([a, b], 1)])
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
): Effect<T, Failure<A> | Failure<B>, Context<A> | Context<B>> {
  return map<
    [Success<A>, Success<B>],
    T,
    Failure<A> | Failure<B>,
    Context<A> | Context<B>
  >(fn)(zip(a, b, options))
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
      const b = Effect.fail('err' as const)
      const z = Effect.zipWith(a, b, ([a, b]) => `${a}-${b}`)
      expectTypeOf(z).toEqualTypeOf<Effect<string, 'err', never>>()
      await expect(Effect.runPromise(z)).rejects.toEqual('err')
    })
  })
}
