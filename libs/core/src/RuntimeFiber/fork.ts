import type { Effect } from '../Effect'
import { create } from './create'
import type { RuntimeFiber } from './types'

export const fork = <Success, Failure>(
  fiber: RuntimeFiber<unknown, unknown>,
  effect: Effect<Success, Failure, never>,
): RuntimeFiber<Success, Failure> => {
  const child = create(effect, fiber)
  fiber.childs.push(child)
  return child
}
