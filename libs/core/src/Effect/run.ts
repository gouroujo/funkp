import { Effect } from '.'
import { createFiber, runFiber, wait } from '../Fiber'
import { pipe } from '../functions'

export function runPromise<Success, Failure>(
  effect: Effect<Success, Failure, never>,
) {
  return pipe(createFiber(effect), runFiber(), wait())
}

if (import.meta.vitest) {
  const { describe, it, expect } = import.meta.vitest
  describe('runPromise', async () => {
    const succeed = (await import('./constructors/succeed')).succeed
    it('should run a synchronous Effect and returns its result', async () => {
      const effect = succeed(123)
      const result = await runPromise(effect)
      expect(result).toEqual({ _tag: 'Right', right: 123 })
    })
  })
}
