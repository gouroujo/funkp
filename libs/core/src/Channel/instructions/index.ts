import type { PutInstruction } from './put'
import type { SleepInstruction } from './sleep'
import type { TakeInstruction } from './take'

export * from './put'
export * from './sleep'
export * from './take'

export type Instruction<T> =
  | TakeInstruction<T>
  | PutInstruction<T>
  | SleepInstruction<T>
