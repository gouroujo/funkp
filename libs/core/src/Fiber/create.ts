import { nominal } from '../Brand'
import { Effect } from '../Effect'
import { Fiber, FiberId } from './fiber'

const generateFiberId = () => {
  const construct = nominal<FiberId>()
  return construct(crypto.randomUUID())
}

export function createFiber<Success, Failure>(
  effect: Effect<Success, Failure, never>,
  parentId?: FiberId,
): Fiber<Success, Failure> {
  const id = generateFiberId()
  return {
    id,
    ...(parentId ? { parentId } : {}),
    childs: [],
    status: 'Suspended',
    callStack: [() => effect],
    listeners: [],
    // effect,
  }
}
