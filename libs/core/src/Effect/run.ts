import { createFiber, runFiber, wait } from '../Fiber'
import { pipe } from '../functions'
import type { Effect } from './types'

export function runPromise<Success, Failure>(
  effect: Effect<Success, Failure, never>,
) {
  const fiber = createFiber(effect) // TODO: Get the current fiber
  return pipe(fiber, runFiber(), wait())
}

if (import.meta.vitest) {
  const { describe, it, expect } = import.meta.vitest
  describe('runPromise', async () => {
    const { succeed } = await import('./constructors/succeed')
    it('should run a synchronous Effect and returns its result', async () => {
      const effect = succeed(123)
      const result = await runPromise(effect)
      expect(result).toEqual({ _tag: 'Right', right: 123 })
    })
  })
}
