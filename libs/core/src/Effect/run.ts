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
  describe('run a synchronous Effect', () => {
    it('runs a synchronous Effect and returns its result', async () => {
      const effect: Effect<number, never, never> = {
        _tag: 'Pure',
        value: 123,
        *[Symbol.iterator]() {
          return yield this
        },
      }
      const result = await runPromise(effect)
      expect(result).toEqual({
        _tag: 'Right',
        right: 123,
      })
    })
  })
}
