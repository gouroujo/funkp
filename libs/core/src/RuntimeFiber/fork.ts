import type { Effect } from '../Effect'
import { create } from './create'
import type { RuntimeFiber } from './types'

export const fork = <Success, Failure, Context>(
  fiber: RuntimeFiber<any, any, Context>,
  effect: Effect<Success, Failure, never>,
): RuntimeFiber<Success, Failure, Context> => {
  const child = create(effect, fiber.runtime, fiber)
  fiber.childs.push(child)
  return child
}
