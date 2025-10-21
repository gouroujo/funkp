import * as Runtime from '../Runtime'
import { RuntimeFiber } from '../RuntimeFiber'
import type { Effect } from './types'

export function runPromise<Success, Failure>(
  effect: Effect<Success, Failure, never>,
) {
  return Runtime.runPromise()(effect)
}

export function runFork<Success, Failure>(
  effect: Effect<Success, Failure, never>,
): RuntimeFiber<Success, Failure> {
  return Runtime.runFork()(effect)
}

if (import.meta.vitest) {
  const { describe, it, expect } = import.meta.vitest
  describe('runPromise', async () => {
    const { succeed } = await import('./constructors/succeed')
    const { fail } = await import('./constructors/fail')

    it('should run a synchronous Effect and returns its result', async () => {
      const effect = succeed(123)
      await expect(runPromise(effect)).resolves.toEqual(123)
    })
    it('should run a synchronous Effect and reject in case of failure', async () => {
      const effect = fail('error')
      await expect(runPromise(effect)).rejects.toEqual('error')
    })
  })
}
