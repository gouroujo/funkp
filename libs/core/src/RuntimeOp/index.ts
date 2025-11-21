import type { Effect } from 'src/Effect/effect'
import type { ASYNC_OP } from './async'
import type { DELEGATE_OP } from './delegate'
import type { FAIL_OP } from './fail'
import type { FORK_OP } from './fork'
import type { INJECT_OP } from './inject'
import type { INTERRUPT_OP } from './interrupt'
import type { ON_FAILURE_OP } from './onFailure'
import type { ON_SUCCESS_OP } from './onSuccess'
import type { PURE_OP } from './pure'
import type { SLEEP_OP } from './sleep'
import type { WITH_RUNTIME_OP } from './withRuntime'
import type { YIELD_OP } from './yield'

export * from './async'
export * from './delegate'
export * from './fail'
export * from './fork'
export * from './inject'
export * from './interrupt'
export * from './onFailure'
export * from './onSuccess'
export * from './pure'
export * from './sleep'
export * from './sync'
export * from './withRuntime'
export * from './yield'

export type OperationType<Op extends Operation<unknown, unknown, unknown>> =
  Op['_op']
export type OperationSuccessType<
  O extends Operation<unknown, unknown, unknown>,
> = O extends Operation<infer S, infer _, infer _> ? S : never
export type OperationFailureType<
  O extends Operation<unknown, unknown, unknown>,
> = O extends Operation<infer _, infer F, infer _> ? F : never

export type Operation<Success, Failure, Context> =
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
    }
  | {
      _op: typeof ON_FAILURE_OP
      fn: (value: any) => Failure
    }
  | { _op: typeof SLEEP_OP; ms: number }
  | { _op: typeof INJECT_OP; token: string }
  | { _op: typeof INTERRUPT_OP }
  // | ReturnType<typeof sync>
  | { _op: typeof WITH_RUNTIME_OP }
  | { _op: typeof YIELD_OP }
  | { _op: typeof DELEGATE_OP; effect: Effect<Success, Failure, Context> }
