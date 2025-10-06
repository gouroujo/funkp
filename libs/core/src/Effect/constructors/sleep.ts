import { right } from '../../Either'
import { sleep as _sleep } from '../../Fiber/instructions'
import type { Effect } from '../types'

export const sleep = (ms: number): Effect<void, never, never> => {
  return {
    *[Symbol.iterator]() {
      yield _sleep(ms)
      return right(undefined)
    },
  }
}

if (import.meta.vitest) {
  const { it, expect, describe, expectTypeOf } = import.meta.vitest
  describe('Effect.sleep', async () => {
    const runPromise = (await import('../run')).runPromise

    it('should return an Effect<void, never, never>', () => {
      const effect = sleep(10)
      expectTypeOf(effect).toEqualTypeOf<Effect<void, never, never>>()
    })

    it('should resolve after the specified delay', async () => {
      const effect = sleep(50)
      const start = Date.now()
      const result = await runPromise(effect)
      const elapsed = Date.now() - start
      expect(result).toEqualRight(undefined)
      expect(elapsed).toBeGreaterThanOrEqual(45)
    })
  })
}
