import * as RuntimeFiber from '../RuntimeFiber'

type SuccessMap<E extends RuntimeFiber.RuntimeFiber<unknown, unknown>[]> = {
  [I in keyof E]: RuntimeFiber.Success<E[I]>
}
type Union<T extends unknown[]> = T[number]


export function zip<F extends RuntimeFiber.RuntimeFiber<unknown, unknown>[]>(
  fibers: [...F],
): RuntimeFiber.RuntimeFiber<SuccessMap<F>, Union<F>> {
  
}
