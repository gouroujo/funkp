import * as O from '../../RuntimeOp'
import type { Effect } from '../effect'
import { effectable } from '../internal/effectable'

export const sleep = (ms: number): Effect<void, never, never> => {
  return effectable([O.sleep(ms)])
}

if (import.meta.vitest) {
  const { it, expect, describe, expectTypeOf, vi } = import.meta.vitest
  const Effect = await import('src/Effect')

  describe('Effect.sleep', async () => {
    it('should return an Effect<void, never, never>', () => {
      expectTypeOf(Effect.sleep(10)).toEqualTypeOf<Effect<void, never, never>>()
    })
    it('should resolve after the specified delay', async ({onTestFinished}) => {
      vi.useFakeTimers()
      onTestFinished(() => void vi.useRealTimers())
      const start = Date.now()
      const promise = Effect.runPromise(Effect.sleep(50))
      await vi.runAllTimersAsync()
      await expect(promise).resolves.toBeUndefined()
      expect(Date.now() - start).toBeGreaterThanOrEqual(50)
    })
  })
}
