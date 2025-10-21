import type { Effect } from '../Effect'
import { Id } from './id'
import type { RuntimeFiber } from './types'

export function create<Success, Failure>(
  effect: Effect<Success, Failure, never>,
  parent?: RuntimeFiber<unknown, unknown>,
): RuntimeFiber<Success, Failure> {
  const id = Id()
  return {
    id,
    ...(parent ? { parent } : {}),
    childs: [],
    effect,
    status: 'suspended',
    listeners: [],
  }
}
