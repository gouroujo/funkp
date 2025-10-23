import type { Effect } from '../Effect'
import { Id } from './id'
import type { RuntimeFiber } from './types'

type CreateRuntimeFiberOptions = {
  sync?: boolean
}

export function create<Success, Failure>(
  effect: Effect<Success, Failure, never>,
  parent?: RuntimeFiber<unknown, unknown>,
  options?: CreateRuntimeFiberOptions,
): RuntimeFiber<Success, Failure> {
  const id = Id()
  return {
    id,
    ...(parent ? { parent } : {}),
    childs: [],
    effect,
    status: 'suspended',
    listeners: [],
    sync: options?.sync ?? false,
  }
}
