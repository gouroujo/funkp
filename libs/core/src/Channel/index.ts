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

export type Channel<T> = {
  takers?: Array<(value: T | null) => void>
  buffer: Array<T>
  listeners?: Array<[resolve: (result: T) => void, reject: (result: T) => void]>
  closed: boolean
}

export type ChannelFn<C extends Channel<any>> =
  C extends Channel<infer T> ? Generator<Instruction<T>, void, T | null> : never

export type Instruction<T> =
  | TakeInstruction<T>
  | PutInstruction<T>
  | SleepInstruction<T>
  | AsyncInstruction<T>
