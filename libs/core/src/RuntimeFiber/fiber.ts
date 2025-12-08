import type { Brand } from 'src/Brand'
import type { Channel } from 'src/Channel'
import type { Effect } from 'src/Effect'
import { Either } from 'src/Either'
import type { Exit } from 'src/Exit'
import type { Runtime } from 'src/Runtime'

export type RuntimeFiberId = string & Brand<'FiberId'>
export type RuntimeFiberStatus =
  | 'running'
  | 'suspended'
  | 'closed'
  | 'interrupted'

export interface RuntimeFiber<Success, Failure> {
  id: RuntimeFiberId
  runtime: Runtime<unknown>
  parent?: RuntimeFiber<unknown, unknown>
  childs: RuntimeFiber<unknown, unknown>[]
  effect: Effect<Success, Failure, never>
  status: RuntimeFiberStatus
  channel: Channel<string, Either<Failure, Success>>
  result?: Exit<Success, Failure>
  // promise: () => Promise<Either<Success, Failure>>
  sync: boolean
  listeners: Array<
    [
      resolve: (exit: Exit<Success, Failure>) => void,
      reject: (error: unknown) => void,
    ]
  >
}

export type Success<T extends RuntimeFiber<unknown, unknown>> =
  T extends RuntimeFiber<infer S, unknown> ? S : never
export type Failure<T extends RuntimeFiber<unknown, unknown>> =
  T extends RuntimeFiber<unknown, infer F> ? F : never
export type ExitType<T extends RuntimeFiber<unknown, unknown>> =
  T extends RuntimeFiber<infer S, infer F> ? Exit<S, F> : never
