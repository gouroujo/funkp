import type { Effect } from '../Effect'
import { create } from './create'
import type { RuntimeFiber } from './fiber'

export const fork = <Success, Failure>(
  fiber: RuntimeFiber<any, any>,
  effect: Effect<Success, Failure, never>,
): RuntimeFiber<Success, Failure> => {
  const child = create(effect, fiber.runtime, fiber)
  fiber.childs.push(child)
  return child
}
