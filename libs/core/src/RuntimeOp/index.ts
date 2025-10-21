import type { AsyncOperation } from './async'
import type { FailOperation } from './fail'
import type { InjectOperation } from './inject'
import type { PureOperation } from './pure'
import type { SleepOperation } from './sleep'
import type { SyncOperation } from './sync'
import type { CooperativeYieldingOperation } from './yield'

export * from './async'
export * from './fail'
export * from './inject'
export * from './pure'
export * from './sleep'
export * from './sync'
export * from './yield'

export type Operation =
  | FailOperation
  | InjectOperation
  | AsyncOperation
  | PureOperation
  | SleepOperation
  | SyncOperation
  | CooperativeYieldingOperation
