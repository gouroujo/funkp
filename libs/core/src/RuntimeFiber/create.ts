import * as C from 'src/Channel'
import * as E from 'src/Either'

import type { Runtime } from 'src/Runtime'
import type { Effect } from '../Effect'
import type { RuntimeFiber } from './fiber'
import { Id } from './id'
import { terminate } from './terminate'

type CreateRuntimeFiberOptions = {
  sync?: boolean
}

export function create<Success, Failure>(
  effect: Effect<Success, Failure, never>,
  runtime: Runtime<unknown>,
  parent?: RuntimeFiber<unknown, unknown>,
  options?: CreateRuntimeFiberOptions,
): RuntimeFiber<Success, Failure> {
  const id = Id()
  const channel = C.chan<E.Either>(1, { fill: E.right() })
  const fiber = {
    id,
    ...(parent ? { parent } : {}),
    childs: [],
    runtime,
    effect,
    status: 'suspended',
    channel,
    sync: options?.sync ?? false,
    listeners: [],
  } satisfies RuntimeFiber<Success, Failure>

  C.onClose(channel as C.Channel<E.Either<Success, Failure>>, terminate(fiber))

  return fiber
}
