import * as Op from '../RuntimeOp'
import type { Effect } from './effect'

export function interrupt(): Effect<never, never, never> {
  return {
    *[Symbol.iterator]() {
      throw yield Op.interrupt()
    },
  }
}

if (import.meta.vitest) {
  const { describe, it, expect, vi } = import.meta.vitest

  describe('Effect.interrupt', async () => {
    const Effect = await import('.')
    const E = await import('../Either')

    it('should interrupt the current fiber', async () => {
      const spy = vi.fn()
      const program = Effect.gen(function* () {
        spy('start')
        yield* Effect.sleep(10)
        yield* Effect.interrupt()
        spy('done')
        return E.right(42)
      })
      await expect(Effect.runPromise(program)).rejects.toEqual('Interrupted')
      expect(spy).toHaveBeenCalledWith('start')
      expect(spy).not.toHaveBeenCalledWith('done')
      expect(spy).toHaveBeenCalledTimes(1)
    })
  })
}
