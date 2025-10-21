import { Effect } from '../Effect'
import { Exit } from '../Exit'
import * as RuntimeFiber from '../RuntimeFiber'
import { async } from '../RuntimeOp'

export default function <Success, Failure>(
  fiber: RuntimeFiber.RuntimeFiber<Success, Failure>,
): Effect<Exit<Success, Failure>, never, never> {
  return {
    *[Symbol.iterator]() {
      return yield async(RuntimeFiber.await(fiber))
    },
  }
}
