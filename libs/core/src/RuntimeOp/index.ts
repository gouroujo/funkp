import type { promise } from './async'
import type { fail } from './fail'
import type { fork } from './fork'
import type { inject } from './inject'
import type { interrupt } from './interrupt'
import type { pure } from './pure'
import type { sleep } from './sleep'
import type { sync } from './sync'
import type { withRuntime } from './withRuntime'
import type { yieldNow } from './yield'

export * from './async'
export * from './fail'
export * from './fork'
export * from './inject'
export * from './interrupt'
export * from './pure'
export * from './sleep'
export * from './sync'
export * from './withRuntime'
export * from './yield'

export type OperationValue<Op extends Operation> = Op extends { value: infer V }
  ? V
  : undefined
export type OperationType<Op extends Operation> = Op['_op']
export type Operation<Failure = never> =
  | ReturnType<typeof promise>
  | ReturnType<typeof fail<Failure>>
  | ReturnType<typeof fork>
  | ReturnType<typeof pure>
  | ReturnType<typeof sleep>
  | ReturnType<typeof inject>
  | ReturnType<typeof interrupt>
  | ReturnType<typeof pure>
  | ReturnType<typeof sync>
  | ReturnType<typeof withRuntime>
  | ReturnType<typeof yieldNow>
