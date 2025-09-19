import { Effect } from '..'
import { runPromise } from '../run'

export function promise<Success>(
  promiseFn: () => Promise<Success>,
): Effect<Success, never, never> {
  return {
    _tag: 'Promise',
    promiseFn,
    *[Symbol.iterator]() {
      return yield this
    },
  }
}

export function tryPromise<Success, Failure>(
  promiseFn: () => Promise<Success>,
  catchFn: (error: unknown) => Failure,
): Effect<Success, Failure, never> {
  return {
    _tag: 'Promise',
    promiseFn,
    catchFn,
    *[Symbol.iterator]() {
      return yield this
    },
  }
}

export function delay<T>(value: T, ms: number): Effect<T, never, never> {
  return promise<T>(
    () =>
      new Promise((resolve) => {
        setTimeout(() => {
          resolve(value)
        }, ms)
      }),
  )
}
export function delayFail<E>(error: E, ms: number): Effect<never, E, never> {
  return tryPromise<never, E>(
    () =>
      new Promise((_, reject) => {
        setTimeout(() => {
          reject(error)
        }, ms)
      }),
    (e) => e as E,
  )
}

if (import.meta.vitest) {
  const { describe, it, expect, expectTypeOf } = import.meta.vitest

  describe('Promise constructor', () =>
    it('should handle async failure', async () => {
      const effect = promise(() => Promise.resolve('async result' as const))
      expectTypeOf(effect).toEqualTypeOf<Effect<'async result', never, never>>()
      const result = await runPromise(effect)
      expect(result).toEqual({ _tag: 'Right', right: 'async result' })
    }))

  describe('Try-Promise constructor', () =>
    it('should handle async failure', async () => {
      const effect = tryPromise(
        () => Promise.reject('async error'),
        (error) => 'error: ' + error,
      )
      expectTypeOf(effect).toEqualTypeOf<Effect<never, string, never>>()
      const result = await runPromise(effect)
      expect(result).toEqual({ _tag: 'Left', left: 'error: async error' })
    }))
}
