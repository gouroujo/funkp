/* eslint-disable @typescript-eslint/no-explicit-any */

export * from './constructors'
export * from './operators'
// export * from './provide'
export * from './run'

export type Success<T extends Effect<unknown, unknown, unknown>> =
  T extends Effect<infer S, unknown, unknown> ? S : never
export type Error<T extends Effect<unknown, unknown, unknown>> =
  T extends Effect<unknown, infer E, unknown> ? E : never
export type Context<T extends Effect<unknown, unknown, unknown>> =
  T extends Effect<unknown, unknown, infer C> ? C : never

export type Effect<Success, Failure = never, Requirements = never> =
  | Pure<Success>
  | Fail<Failure>
  | Map<Success, Failure, Requirements>
  | Flat<Success, Failure, Requirements>
  | Async<Success, Failure>
  | Gen<Success, Failure, Requirements>

interface Async<Success, Failure> {
  _tag: 'Promise'
  promiseFn: (prevValue: any) => Promise<Success>
  catchFn?: (error: unknown) => Failure
  [Symbol.iterator](): Iterator<Effect<Success, Failure>, Success>
}

interface Pure<Success> {
  _tag: 'Pure'
  value: Success
  [Symbol.iterator](): Iterator<Effect<Success, never, never>, Success>
}
interface Fail<Failure> {
  _tag: 'Fail'
  error: Failure
  [Symbol.iterator](): Iterator<Effect<never, Failure, never>, never>
}
interface Map<Success, Failure, Requirements, PrevSuccess = any> {
  _tag: 'Map'
  effect: Effect<PrevSuccess, Failure, Requirements>
  fn: (a: PrevSuccess) => Success
  [Symbol.iterator](): Iterator<Effect<Success, Failure, Requirements>, Success>
}
interface Flat<S, F1, R1, F2 = any, R2 = any> {
  _tag: 'Flat'
  effect: Effect<Effect<S, F1, R1>, F2, R2>
  [Symbol.iterator](): Iterator<Effect<S, F1 | F2, R1 | R2>, S>
}

interface Gen<Success, Failure, Requirements> {
  _tag: 'Gen'
  gen: () => Generator<Effect<any, Failure, Requirements>, Success, any>
  [Symbol.iterator](): Iterator<Effect<Success, Failure, Requirements>, Success>
}
