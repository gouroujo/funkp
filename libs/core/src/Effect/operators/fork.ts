import * as RuntimeFiber from '../../RuntimeFiber'
import { Effect } from '../types'

export const fork = <Success, Failure>(
  effect: Effect<Success, Failure, never>,
): Effect<RuntimeFiber.RuntimeFiber<Success, Failure>, never, never> => ({
  *[Symbol.iterator]() {
    const parent = yield 'current fiber'
    const child = Fiber.fork(parent)(effect)
    return child
  },
})
