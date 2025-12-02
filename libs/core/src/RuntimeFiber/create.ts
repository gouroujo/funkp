import { chan } from 'src/Channel'
import type { Runtime } from 'src/Runtime'
import type { Effect } from '../Effect'
import { Id } from './id'
import type { RuntimeFiber } from './types'

type CreateRuntimeFiberOptions = {
  sync?: boolean
}

export function create<Success, Failure, Context>(
  effect: Effect<Success, Failure, never>,
  runtime: Runtime<Context>,
  parent?: RuntimeFiber<unknown, unknown, unknown>,
  options?: CreateRuntimeFiberOptions,
): RuntimeFiber<Success, Failure, Context> {
  const id = Id()
  return {
    id,
    ...(parent ? { parent } : {}),
    childs: [],
    runtime,
    effect,
    status: 'suspended',
    channel: chan(1),
    listeners: [],
    sync: options?.sync ?? false,
  }
}
