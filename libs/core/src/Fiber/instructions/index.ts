import { T } from 'vitest/dist/chunks/environment.d.cL3nLXbE.js'
import type { ForkInstruction } from './fork'
import type { inject } from './inject'
import type { PureInstruction } from './pure'
import type { stop } from './stop'
import type { SuspendInstruction } from './suspend'

export * from './fork'
export * from './inject'
export * from './pure'
export * from './stop'
export * from './suspend'

export type Instruction =
  | ReturnType<typeof inject<T>>
  | SuspendInstruction
  | ReturnType<typeof stop<T>>
  | ForkInstruction
  | PureInstruction<any>
