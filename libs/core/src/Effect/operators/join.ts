import { fail, succeed, type Effect } from 'src/Effect'
import { isSuccess } from 'src/Exit'
import * as RuntimeFiber from 'src/RuntimeFiber'
import * as O from 'src/RuntimeOp'
import { effectable } from '../internal/effectable'

export const join = <Success, Failure, Context>(
  fiber: RuntimeFiber.RuntimeFiber<Success, Failure>,
): Effect<Success, Failure, never> => {
  return effectable([
    O.promise(() => RuntimeFiber.await(fiber)),
    O.onSuccess((exit) => {
      if (isSuccess(exit)) {
        return succeed(exit.success)
      } else {
        return fail(exit.failure)
      }
    }),
  ])
}

if (import.meta.vitest) {
  const { describe, it, expect, expectTypeOf } = import.meta.vitest
  describe('Fiber.join', async () => {
    const Effect = await import('src/Effect')
    const Runtime = await import('src/Runtime')
    it('should join a succesfull fiber', async () => {
      const effect = Effect.succeed(42)
      const fiber = Runtime.runFork()(effect)
      const joined = Effect.join(fiber)
      expectTypeOf(joined).toEqualTypeOf<Effect<number, never, never>>()
      await expect(Effect.runPromise(joined)).resolves.toEqual(42)
    })
    it('should join a fail fiber', async () => {
      const effect = Effect.fail('boo' as const)
      const fiber = Runtime.runFork()(effect)
      const joined = Effect.join(fiber)
      expectTypeOf(joined).toEqualTypeOf<Effect<never, 'boo', never>>()
      await expect(Effect.runPromise(joined)).rejects.toEqual('boo')
    })
  })
}
