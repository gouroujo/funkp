import type {
  AsyncInstruction,
  PutInstruction,
  SleepInstruction,
  TakeInstruction,
} from './operations'

export * from './chan'
export * from './close'
export * from './go'
export * from './isClosed'
export * from './isEmpty'
export { async, put, sleep, take } from './operations'
export * from './wait'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Channel<T = any> = {
  takers: Array<(value: T | null) => void>
  buffer: Array<T>
  listeners: Array<[resolve: (result: T) => void, reject: (result: T) => void]>
  closed: boolean
}

export type Instruction<T = any> =
  | TakeInstruction
  | PutInstruction<T>
  | SleepInstruction
  | AsyncInstruction<T>
