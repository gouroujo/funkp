import * as Op from '../../RuntimeOp'
import type { Effect } from '../types'

export const promise = <Success>(
  promiseFn: () => Promise<Success>,
): Effect<Success, never, never> => {
  return {
    *[Symbol.iterator]() {
      return yield Op.promise(promiseFn())
    },
  }
}

export const tryCatch = <Success, Failure>(
  promiseFn: () => Promise<Success>,
  catchFn: (error: unknown) => Failure,
): Effect<Success, Failure, never> => {
  return {
    *[Symbol.iterator]() {
      try {
        return yield Op.promise(promiseFn())
      } catch (error: unknown) {
        throw yield Op.fail(catchFn(error))
      }
    },
  }
}

if (import.meta.vitest) {
  const { describe, it, expect, expectTypeOf } = import.meta.vitest

  describe('Effect.promise', async () => {
    const runPromise = (await import('../run')).runPromise
    it('should handle async resolve', async () => {
      const effect = promise(() => Promise.resolve('async result' as const))
      expectTypeOf(effect).toEqualTypeOf<Effect<'async result', never, never>>()
      await expect(runPromise(effect)).resolves.toEqual('async result')
    })

    it.skip('should throw on failure', async () => {
      const effect = promise(() => Promise.reject('async error' as const))
      await expect(runPromise(effect)).rejects.toEqual('async error')
    })
  })

  describe('Effect.tryCatch', async () => {
    const runPromise = (await import('../run')).runPromise
    it('should handle async failure', async () => {
      const effect = tryCatch(
        () => Promise.reject('async error'),
        (error) => 'error: ' + error,
      )
      expectTypeOf(effect).toEqualTypeOf<Effect<never, string, never>>()
      await expect(runPromise(effect)).rejects.toEqual('error: async error')
    })
  })
}
