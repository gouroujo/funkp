import * as Op from '../../RuntimeOp'
import type { Effect } from '../types'

export const sleep = (ms: number): Effect<void, never, never> => {
  return {
    *[Symbol.iterator]() {
      return yield Op.sleep(ms)
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
      const start = Date.now()
      await runPromise(sleep(50))
      const elapsed = Date.now() - start
      expect(elapsed).toBeGreaterThanOrEqual(50)
    })
  })
}
