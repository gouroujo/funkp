import * as RuntimeFiber from '../../RuntimeFiber'
import * as Op from '../../RuntimeOp'

import { Effect } from '../types'

export const fork = <Success, Failure>(
  effect: Effect<Success, Failure, never>,
): Effect<RuntimeFiber.RuntimeFiber<Success, Failure>, never, never> => ({
  *[Symbol.iterator]() {
    return yield Op.fork(effect)
  },
})

if (import.meta.vitest) {
  const { describe, it, expect, expectTypeOf } = import.meta.vitest

  describe('Effect.fork', async () => {
    const { succeed, zipWith, gen, suspend } = await import('../index')
    const Fiber = await import('../../Fiber')
    const fib = (n: number): Effect<number> =>
      n < 2
        ? succeed(1)
        : zipWith(
            suspend(() => fib(n - 1)),
            suspend(() => fib(n - 2)),
            (a, b) => a + b,
          )

    it('should fork an effect into a separate fiber', async () => {
      const runPromise = (await import('../run')).runPromise
      const effect = fib(10)
      const fib10Fiber = fork(effect)
      const program = gen(function* () {
        const fiber = yield* fib10Fiber
        const n = yield* Fiber.join(fiber)
        console.log('Fib(10) = ', n)
        return n
      })
      await expect(runPromise(program)).resolves.toBe(89)
    })
  })
}
