import { Either } from 'src/Either'
import { Fiber } from './fiber'

export function exit<Success, Failure>(result: Either<Failure, Success>) {
  return (fiber: Fiber<Success, Failure>) => {
    while (fiber.listeners.length > 0) {
      const listener = fiber.listeners.pop()
      if (listener) listener(result)
    }
    return fiber
  }
}
