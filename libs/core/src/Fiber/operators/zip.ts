import { Fiber, Success } from '../fiber'

type SuccessMap<E extends Fiber<unknown, unknown>[]> = {
  [I in keyof E]: Success<E[I]>
}
type Union<T extends unknown[]> = T[number]

export function zip<F extends Fiber<unknown, unknown>[]>(
  fibers: [...F],
): Fiber<SuccessMap<F>, Union<F>> {
  return
}
