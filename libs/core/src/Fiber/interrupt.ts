import * as Effect from '../Effect'
import type { Exit } from '../Exit'
import * as RuntimeFiber from '../RuntimeFiber'
import * as Op from '../RuntimeOp'

export const interrupt = <Success, Failure>(
  fiber: RuntimeFiber.RuntimeFiber<Success, Failure>,
): Effect.Effect<Exit<Success, Failure>, never, never> => {
  return {
    *[Symbol.iterator]() {
      return yield Op.promise(RuntimeFiber.interrupt(fiber))
    },
  }
}

export const interruptFork = <Success, Failure>(
  fiber: RuntimeFiber.RuntimeFiber<Success, Failure>,
): Effect.Effect<void, never, never> => {
  return {
    *[Symbol.iterator]() {
      Effect.fork(interrupt(fiber))
      return yield Op.sync(null)
    },
  }
}
