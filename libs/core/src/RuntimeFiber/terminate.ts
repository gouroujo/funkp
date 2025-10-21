import { Either, isRight } from '../Either'
import * as Exit from '../Exit'
import { RuntimeFiber } from './types'

export const terminate = <Success, Failure>(
  fiber: RuntimeFiber<Success, Failure>,
) => {
  return (result: Either<Failure, Success>) => {
    fiber.status = 'closed'
    fiber.result = isRight(result)
      ? Exit.succeed(result.right)
      : Exit.fail(result.left)
    fiber.listeners.forEach(([resolve, reject]) => {
      if (isRight(result)) {
        resolve(Exit.succeed(result.right))
      } else {
        resolve(Exit.fail(result.left))
      }
    })
  }
}
