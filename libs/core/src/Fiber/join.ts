import { async } from 'src/RuntimeOp'
import type { Effect } from '../Effect'
import * as RuntimeFiber from '../RuntimeFiber'

export const join = <Success, Failure>(
  fiber: RuntimeFiber.RuntimeFiber<Success, Failure>,
): Effect<Success, never, never> => {
  return {
    *[Symbol.iterator]() {
      return yield async(RuntimeFiber.await(fiber))
    },
  }
}
