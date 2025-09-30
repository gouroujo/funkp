/* eslint-disable @typescript-eslint/no-explicit-any */

import type { Instruction } from '../Channel'
import type { Context } from '../Context'
import type * as E from '../Either'

export * from './constructors'
export * from './operators'
export * from './run'

export type Success<T extends Effect<unknown, unknown, any>> =
  T extends Effect<infer S, unknown, any> ? S : never
export type Failure<T extends Effect<unknown, unknown, any>> =
  T extends Effect<unknown, infer F, any> ? F : never
export type Requirements<T extends Effect<unknown, unknown, any>> =
  T extends Effect<unknown, unknown, infer C> ? C : never

export type Effect<Success, Failure = never, Requirements = never> = {
  [Symbol.iterator](): Iterator<
    Instruction | Requirements,
    E.Either<Failure, Success>,
    any
  >
  context?: Context
}
