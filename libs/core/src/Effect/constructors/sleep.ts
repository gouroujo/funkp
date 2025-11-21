import * as O from '../../RuntimeOp'
import type { Effect } from '../effect'
import { effectable } from '../internal/effectable'

export const sleep = (ms: number): Effect<void, never, never> => {
  return effectable([O.sleep(ms)])
}

if (import.meta.vitest) {
  const { it, expect, describe, expectTypeOf } = import.meta.vitest
  describe('Effect.sleep', async () => {
    const runPromise = (await import('../run')).runPromise

    it('should return an Effect<void, never, never>', () => {
      expectTypeOf(sleep(10)).toEqualTypeOf<Effect<void, never, never>>()
    })

    it('should resolve after the specified delay', async () => {
      const start = Date.now()
      await expect(runPromise(sleep(50))).resolves.toBeUndefined()
      const elapsed = Date.now() - start
      expect(elapsed).toBeGreaterThanOrEqual(50)
    })
  })
}
