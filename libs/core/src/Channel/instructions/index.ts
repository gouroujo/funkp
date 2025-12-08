import type { PutInstruction } from './put'
import type { SleepInstruction } from './sleep'
import type { TakeInstruction } from './take'
import type { WaitInstruction } from './wait'

export * from './put'
export * from './sleep'
export * from './take'
export * from './wait'

export type Instruction<T> =
  | TakeInstruction<T>
  | PutInstruction<T>
  | SleepInstruction<T>
  | WaitInstruction<T>
