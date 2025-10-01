import type { Buffer } from './buffer'
import { PutInstruction, SleepInstruction, TakeInstruction } from './operations'


// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Channel<T = any> = {
  _tag: 'channel'
  takers: Array<(value: T | null) => void>
  buffer: Buffer<T>
  listeners: Array<[resolve: (result: T) => void, reject: (result: T) => void]>
  closed: boolean
}

export type Instruction<T = any> =
  | TakeInstruction
  | PutInstruction<T>
  | SleepInstruction
