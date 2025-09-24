/* eslint-disable @typescript-eslint/no-explicit-any */

import type { Channel, Instruction } from '../Channel'
import type * as E from '../Either'

export * from './constructors'
export * from './operators'
// export * from './provide'
export * from './run'

export type Success<T extends Effect<unknown, unknown, unknown>> =
  T extends Effect<infer S, unknown, unknown> ? S : never
export type Failure<T extends Effect<unknown, unknown, unknown>> =
  T extends Effect<unknown, infer F, unknown> ? F : never
export type Context<T extends Effect<unknown, unknown, unknown>> =
  T extends Effect<unknown, unknown, infer C> ? C : never

export type Effect<Success, Failure = never, Requirements = never> = (
  channel: Channel<E.Either<Failure, Success>>,
) => Generator<
  Instruction<E.Either<Failure, Success>>,
  void,
  E.Either<Failure, any> | null
>
