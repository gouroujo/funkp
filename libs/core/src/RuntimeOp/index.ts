import type { Effect } from 'src/Effect'
import type { Either } from 'src/Either'

import { isObjectWithKey } from 'src/utils'
import type { ASYNC_OP } from './async'
import type { FAIL_OP } from './fail'
import type { FORK_OP } from './fork'
import type { INJECT_OP } from './inject'
import type { INTERRUPT_OP } from './interrupt'
import type { ITERATE_OP } from './iterate'
import type { ON_FAILURE_OP } from './onFailure'
import type { ON_SUCCESS_OP } from './onSuccess'
import type { PARALLEL_OP } from './parallel'
import type { PURE_OP } from './pure'
import type { SLEEP_OP } from './sleep'

export * from './async'
export * from './fail'
export * from './fork'
export * from './inject'
export * from './interrupt'
export * from './iterate'
export * from './onFailure'
export * from './onSuccess'
export * from './parallel'
export * from './pure'
export * from './sleep'

export type OperationType<Op extends Operation<unknown, unknown, unknown>> =
  Op['_op']
export type OperationSuccessType<
  O extends Operation<unknown, unknown, unknown>,
> = O extends Operation<infer S, infer _, infer _> ? S : never
export type OperationFailureType<
  O extends Operation<unknown, unknown, unknown>,
> = O extends Operation<infer _, infer F, infer _> ? F : never

export const isOperation = (op: unknown): op is Operation<any, any, any> =>
  isObjectWithKey(op, '_op')

export type Operation<Success = any, Failure = any, Context = any> =
  | {
      _op: typeof ASYNC_OP
      fn: () => Promise<Success>
      catchFn?: (e: unknown) => Failure
    }
  | { _op: typeof FAIL_OP; failure: Failure }
  | { _op: typeof FORK_OP; effect: Effect<Success, Failure, Context> }
  | { _op: typeof PURE_OP; value: Success }
  | {
      _op: typeof ON_SUCCESS_OP
      fn: (value: any) => Success
      value: any
    }
  | {
      _op: typeof ON_FAILURE_OP
      fn: (value: any) => Failure
      value: any
    }
  | { _op: typeof SLEEP_OP; ms: number }
  | { _op: typeof INJECT_OP; token: string }
  | { _op: typeof INTERRUPT_OP }
  | {
      _op: typeof ITERATE_OP
      prevValue?: Either<any, any> | undefined
      fn: (prevValue: Either<any, any> | undefined) => Generator<any, any, any>
    }
  | {
      _op: typeof PARALLEL_OP
      concurrency: number
      effects: Effect<any, any, any>[]
    }
