import { nominal } from '../Brand'
import { chan } from '../Channel'
import type { Effect } from '../Effect'
import type * as E from '../Either'
import type { Fiber, FiberId } from './fiber'

const generateFiberId = () => {
  const construct = nominal<FiberId>()
  return construct(crypto.randomUUID())
}

export function createFiber<Success, Failure>(
  effect: Effect<Success, Failure, never>,
  parentId?: FiberId,
): Fiber<Success, Failure> {
  const id = generateFiberId()
  const channel = chan<E.Either<Failure, any>>()
  return {
    id,
    ...(parentId ? { parentId } : {}),
    childs: [],
    effect,
    channel,
  }
}
