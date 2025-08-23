/* eslint-disable @typescript-eslint/no-explicit-any */
export type AnyFunc<TArgs extends any[] = any[], TOut = any> = (
  ...args: TArgs
) => TOut
export type UnaryFunction<TIn = any, TOut = any> = (arg: TIn) => TOut
export type FunctionInput<F extends UnaryFunction> = Parameters<F>[0]
export type FunctionOutput<F extends UnaryFunction> = ReturnType<F>
export type Predicate<T = any> = (value: T) => boolean

export type Invariant<A> = (_: A) => A
export type InvariantType<A> = A extends Invariant<infer U> ? U : never

export type Covariant<A> = (_: never) => A
export type CovariantType<A> = A extends Covariant<infer U> ? U : never

export type Contravariant<A> = (_: A) => void
export type ContravariantType<A> = A extends Contravariant<infer U> ? U : never

export type Bivariant<A, B> = (_: A) => B
export type BivariantType<A> =
  A extends Bivariant<infer U, infer V> ? [U, V] : never
export type BivariantLeftType<A> = A extends Bivariant<infer U, any> ? U : never
export type BivariantRightType<A> =
  A extends Bivariant<any, infer U> ? U : never
