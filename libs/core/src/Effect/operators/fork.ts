import * as RuntimeFiber from 'src/RuntimeFiber'
import * as Op from 'src/RuntimeOp'

import type { Effect } from '../effect'
import { effectable } from '../internal/effectable'

export const fork = <Success, Failure, Context>(
  effect: Effect<Success, Failure, Context>,
): Effect<
  RuntimeFiber.RuntimeFiber<Success, Failure, Context>,
  never,
  never
> => {
  return effectable([Op.fork(effect)])
}

if (import.meta.vitest) {
  const { describe, it, expect, expectTypeOf } = import.meta.vitest

  describe('Effect.fork', async () => {
    const Effect = await import('src/Effect')
    const fib = (n: number): Effect<number> =>
      n < 2
        ? Effect.succeed(1)
        : Effect.zipWith(
            Effect.suspend(() => fib(n - 1)),
            Effect.suspend(() => fib(n - 2)),
            ([a, b]) => a + b,
          )

    it('should fork an effect into a separate fiber', async () => {
      const effect = fib(10)
      const fib10Fiber = fork(effect)
      const program = Effect.gen(function* () {
        const fiber = yield* fib10Fiber
        const n = yield* Effect.join(fiber)
        return n
      })
      await expect(Effect.runPromise(program)).resolves.toBe(89)
    })
  })
}
