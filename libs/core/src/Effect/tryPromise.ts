import { Effect } from '.'
import { left } from '../Either'
import { asyncgen } from './gen'
import { run } from './run'

export function tryPromise<Success, Failure>(
  promiseFn: () => Promise<Success>,
  catchFn: (error: unknown) => Failure,
): Effect<Success, Failure, never> {
  return asyncgen(async function* () {
    try {
      const result = await promiseFn()
      return result
    } catch (error) {
      return yield left(catchFn(error))
    }
  })
}

if (import.meta.vitest) {
  const { describe, it, expect, expectTypeOf } = import.meta.vitest

  describe('Try-Promise constructor', () =>
    it('should handle async failure', async () => {
      const effect = tryPromise(
        () => Promise.reject('async error'),
        (error) => 'error' + error,
      )
      expectTypeOf(effect).toEqualTypeOf<Effect<never, string, never>>()
      const result = await run(effect)
      expect(result).toEqual({ _tag: 'Left', left: 'error: async error' })
    }))
}
