import { createContext } from 'src/Context'
import { nominal } from '../Brand'
import type { Effect } from '../Effect'
import type { Fiber, FiberId } from './fiber'

const generateFiberId = () => {
  const construct = nominal<FiberId>()
  return construct(crypto.randomUUID())
}

export function createFiber<Success, Failure>(
  effect: Effect<Success, Failure, never>,
  parent?: Fiber<unknown, unknown>,
): Fiber<Success, Failure> {
  const id = generateFiberId()
  return {
    id,
    ...(parent ? { parent } : {}),
    childs: [],
    listeners: [],
    effect,
    status: 'suspended',
    context: parent ? {} : createContext(),
  }
}
