import type { Effect } from '..'
import { async, Channel, ChannelFn } from '../../Channel'
import * as E from '../../Either'

const promise = <Success>(
  promiseFn: () => Promise<Success>,
): Effect<Success, never, never> => {
  return function* (
    channel: Channel<E.Either<never, Success>>,
  ): ChannelFn<typeof channel> {
    yield async(channel, promiseFn().then(E.right))
  }
}

export const tryPromise = <Success, Failure, Requirements>(
  promiseFn: () => Promise<Success>,
  catchFn: (error: unknown) => Failure,
): Effect<Success, Failure, Requirements> => {
  return function* (
    channel: Channel<E.Either<Failure, Success>>,
  ): ChannelFn<typeof channel> {
    yield async(
      channel,
      promiseFn()
        .then(E.right)
        .catch((e) => E.left(catchFn(e))),
    )
  }
}

if (import.meta.vitest) {
  const { describe, it, expect, expectTypeOf } = import.meta.vitest

  describe('Promise constructor', async () => {
    const runPromise = (await import('../run')).runPromise
    it('should handle async resolve', async () => {
      const effect = promise(() => Promise.resolve('async result' as const))
      expectTypeOf(effect).toEqualTypeOf<Effect<'async result', never, never>>()
      await expect(runPromise(effect)).resolves.toBeRightWith('async result')
    })
    it('should throw on failure', async () => {
      const effect = promise(() => Promise.reject('async error' as const))
      await expect(runPromise(effect)).rejects.toEqual('async error')
    })
  })

  describe('Try-Promise constructor', async () => {
    const runPromise = (await import('../run')).runPromise
    it('should handle async failure', async () => {
      const effect = tryPromise(
        () => Promise.reject('async error'),
        (error) => 'error: ' + error,
      )
      expectTypeOf(effect).toEqualTypeOf<Effect<never, string, never>>()
      await expect(runPromise(effect)).resolves.toBeLeftWith(
        'error: async error',
      )
    })
  })
}
