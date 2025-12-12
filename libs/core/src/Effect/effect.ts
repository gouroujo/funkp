/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Context } from 'src/Context'
import type { Operation } from 'src/RuntimeOp'
import type { Either } from '../Either'
import type { YieldWrap } from './internal/yieldwrap'
// import type { Context } from '../Context'

export type Success<T extends Effect<unknown, unknown, any>> =
  T extends Effect<infer S, unknown, any> ? S : never
export type Failure<T extends Effect<unknown, unknown, any>> =
  T extends Effect<unknown, infer F, any> ? F : never
export type Requirements<T extends Effect<unknown, unknown, any>> =
  T extends Effect<unknown, unknown, infer C> ? C : never

export type Effect<Success, Failure = never, Requirements = never> = {
  context: Context<Requirements>
  ops: ((prevValue?: unknown) => Operation<Success, Failure, Requirements>)[]
  [Symbol.iterator](): Iterator<
    YieldWrap<Effect<Success, Failure, Requirements>>,
    Success,
    any
  >
}

export type EffectFromEither<E extends Either<any, any>> =
  E extends Either<infer L, infer R> ? Effect<R, L, never> : never
