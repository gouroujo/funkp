import type { ForkInstruction } from './fork'
import type { InjectInstruction } from './inject'
import type { InterruptInstruction } from './interrupt'
import type { PureInstruction } from './pure'
import type { SleepInstruction } from './sleep'
import type { WaitInstruction } from './wait'

export * from './fork'
export * from './inject'
export * from './interrupt'
export * from './pure'
export * from './sleep'
export * from './wait'

export type Instruction =
  | InjectInstruction
  | WaitInstruction
  | InterruptInstruction
  | ForkInstruction
  | PureInstruction
  | SleepInstruction
