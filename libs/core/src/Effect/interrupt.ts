import { pipe } from 'src/functions'
import * as O from '../RuntimeOp'
import type { Effect } from './effect'
import { effectable } from './internal/effectable'

export const interrupt = (): Effect<never, never, never> => {
  return effectable([O.interrupt()])
}

if (import.meta.vitest) {
  const { describe, it, expect, vi } = import.meta.vitest
  const Effect = await import('src/Effect')
  const { InterruptedError } = await import('src/Fiber')
  describe('Effect.interrupt', () => {
    it('should interrupt the current fiber', async () => {
      const spy = vi.fn()
      const program = Effect.gen(function* () {
        spy('start')
        yield* Effect.succeed('foo')
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
    it('should work with a flatmap', async () => {
      const program = pipe(
        Effect.succeed(42),
        Effect.flatmap(() => {
          return Effect.interrupt()
        }),
      )
      await expect(Effect.runPromise(program)).rejects.toBeInstanceOf(
        InterruptedError,
      )
    })
    it('should work with an async flatmap', async () => {
      const program = pipe(
        Effect.sleep(10),
        Effect.flatmap(() => {
          return Effect.interrupt()
        }),
      )
      await expect(Effect.runPromise(program)).rejects.toBeInstanceOf(
        InterruptedError,
      )
    })
  })
}
