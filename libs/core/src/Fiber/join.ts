import type { Effect } from '../Effect'
import { Exit, isSuccess } from '../Exit'
import * as RuntimeFiber from '../RuntimeFiber'
import { fail, promise, pure } from '../RuntimeOp'

export const join = <Success, Failure>(
  fiber: RuntimeFiber.RuntimeFiber<Success, Failure>,
): Effect<Success, never, never> => {
  return {
    *[Symbol.iterator]() {
      const exit: Exit<Success, Failure> = yield promise(
        RuntimeFiber.await(fiber),
      )
      if (isSuccess(exit)) {
        return yield pure(exit.success)
      } else {
        return yield fail(exit.failure)
      }
    },
  }
}
