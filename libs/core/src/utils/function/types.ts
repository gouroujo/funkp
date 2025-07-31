/* eslint-disable @typescript-eslint/no-explicit-any */
export type AnyFunc<TArgs extends any[] = any[], TOut = any> = (
  ...args: TArgs
) => TOut
export type UnaryFunction<TIn = any, TOut = any> = (arg: TIn) => TOut
export type FunctionInput<F extends UnaryFunction> = Parameters<F>[0]
export type FunctionOutput<F extends UnaryFunction> = ReturnType<F>
