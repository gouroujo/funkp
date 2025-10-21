import * as Effect from '../Effect'
import * as RuntimeFiber from '../RuntimeFiber'
import { pure } from '../RuntimeOp'

export const fork = <Success, Failure>(
  effect: Effect.Effect<Success, Failure, never>,
): Effect.Effect<RuntimeFiber.RuntimeFiber<Success, Failure>, never, never> => {
  return {
    *[Symbol.iterator]() {
      const currentFiber = yield injectFiber()
      return yield pure(RuntimeFiber.fork(currentFiber, effect))
    },
  }
}
