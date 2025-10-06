import type { Fiber } from '../fiber'

export const instruct =
  <T extends string, V>(tag: T) =>
  (value: V) => ({
    _tag: tag,
    value,
  })
export type Instruct<T extends ReturnType<typeof instruct<any, any>>> =
  ReturnType<T>
export type InstructionHandler<
  T extends ReturnType<typeof instruct<any, any>>,
> = (
  next: (nextValue?: unknown) => void,
  value: Instruct<T>['value'],
  fiber: Fiber<any, any>,
) => void
