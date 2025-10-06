import { Effect } from '../Effect'
import { createFiber } from './create'
import { Fiber } from './fiber'

export function forkFiber<Success, Failure>(
  effect: Effect<Success, Failure, never>,
) {
  return (parent: Fiber<any, any>) => {
    const child = createFiber(effect, parent)
    parent.childs.push(child)
    return child
  }
}
