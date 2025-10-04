import type { Either } from '../Either'
import type { Fiber } from './fiber'

export const wait = <Success, Failure>() => {
  return (fiber: Fiber<Success, Failure>) => {
    return new Promise<Either<Failure, Success>>((resolve, reject) => {
      fiber.listeners.push([resolve, reject])
    })
  }
}
