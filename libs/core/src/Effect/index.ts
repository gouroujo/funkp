import { Left } from '../Either'

export * from './fail'
export * from './gen'
export * from './isSync'
export * from './promise'
export * from './provide'
export * from './run'
export * from './service'
export * from './succeed'
export * from './tryPromise'

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface Effect<Success, Error = never, Requirements = never> {
  _tag: 'effect'
  [Symbol.asyncIterator]: () => AsyncGenerator<
    Left<Error> | Requirements,
    Success,
    any
  >
}
export interface SyncEffect<Success, Error = never, Requirements = never>
  extends Effect<Success, Error, Requirements> {
  [Symbol.iterator]: () => Generator<Left<Error> | Requirements, Success, any>
}

export type Success<T extends Effect<unknown, unknown, unknown>> =
  T extends Effect<infer S, unknown, unknown> ? S : never
export type Error<T extends Effect<unknown, unknown, unknown>> =
  T extends Effect<unknown, infer E, unknown> ? E : never
export type Context<T extends Effect<unknown, unknown, unknown>> =
  T extends Effect<unknown, unknown, infer C> ? C : never
