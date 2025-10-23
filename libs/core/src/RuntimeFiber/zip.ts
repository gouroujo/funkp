import { RuntimeFiber, Success } from './types'

type SuccessMap<E extends RuntimeFiber<unknown, unknown>[]> = {
  [I in keyof E]: Success<E[I]>
}
type Union<T extends unknown[]> = T[number]

export function zip<F extends RuntimeFiber<unknown, unknown>[]>(
  fibers: [...F],
): RuntimeFiber<SuccessMap<F>, Union<F>> {
  fibers.map((fiber) => {
    fiber.effect
  })
}
