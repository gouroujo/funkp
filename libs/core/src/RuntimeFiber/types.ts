import type { Brand } from '../Brand'
import type { Effect } from '../Effect'
import type { Exit } from '../Exit'

export type RuntimeFiberId = string & Brand<'FiberId'>
export type RuntimeFiberStatus =
  | 'running'
  | 'suspended'
  | 'closed'
  | 'interrupted'

export interface RuntimeFiber<Success, Failure> {
  id: RuntimeFiberId
  parent?: RuntimeFiber<unknown, unknown>
  childs: RuntimeFiber<any, any>[]
  effect: Effect<Success, Failure, never>
  status: RuntimeFiberStatus
  result?: Exit<Success, Failure>
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
