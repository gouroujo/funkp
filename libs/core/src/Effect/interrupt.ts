import * as O from '../RuntimeOp'
import type { Effect } from './effect'
import { effectable } from './internal/effectable'

export const interrupt = (): Effect<void, never, never> => {
  return effectable([O.interrupt()])
}

if (import.meta.vitest) {
  const { describe, it, expect, vi } = import.meta.vitest

  describe('Effect.interrupt', async () => {
    const Effect = await import('src/Effect')
    const { InterruptedError } = await import('src/Fiber')

    it('should interrupt the current fiber', async () => {
      const spy = vi.fn()
      const program = Effect.gen(function* () {
        spy('start')
        yield* Effect.sleep(10)
        yield* Effect.interrupt()
        spy('done')
        return 42
      })
      await expect(Effect.runPromise(program)).rejects.toBeInstanceOf(
        InterruptedError,
      )
      expect(spy).toHaveBeenCalledWith('start')
      expect(spy).not.toHaveBeenCalledWith('done')
      expect(spy).toHaveBeenCalledTimes(1)
    })
  })
}
