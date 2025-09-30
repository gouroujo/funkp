import type { Effect } from '..'
import { async } from '../../Channel'
import * as E from '../../Either'

export const promise = <Success>(
  promiseFn: () => Promise<Success>,
): Effect<Success, never, never> => {
  return {
    *[Symbol.iterator]() {
      return yield async(promiseFn().then(E.right))
    },
  }
}

export const tryCatch = <Success, Failure>(
  promiseFn: () => Promise<Success>,
  catchFn: (error: unknown) => Failure,
): Effect<Success, Failure, never> => {
  return {
    *[Symbol.iterator]() {
      return yield async(
        promiseFn()
          .then(E.right)
          .catch((e) => E.left(catchFn(e))),
      )
    },
  }
}

if (import.meta.vitest) {
  const { describe, it, expect, expectTypeOf } = import.meta.vitest

  describe('Promise constructor', async () => {
    const runPromise = (await import('../run')).runPromise
    it('should handle async resolve', async () => {
      const effect = promise(() => Promise.resolve('async result' as const))
      expectTypeOf(effect).toEqualTypeOf<Effect<'async result', never, never>>()
      await expect(runPromise(effect)).resolves.toEqualRight('async result')
    })

    it.skip('should throw on failure', async () => {
      const effect = promise(() => Promise.reject('async error' as const))
      await expect(runPromise(effect)).rejects.toEqual('async error')
    })
  })

  describe('Try-Promise constructor', async () => {
    const runPromise = (await import('../run')).runPromise
    it('should handle async failure', async () => {
      const effect = tryCatch(
        () => Promise.reject('async error'),
        (error) => 'error: ' + error,
      )
      expectTypeOf(effect).toEqualTypeOf<Effect<never, string, never>>()
      await expect(runPromise(effect)).resolves.toEqualLeft(
        'error: async error',
      )
    })
  })
}
