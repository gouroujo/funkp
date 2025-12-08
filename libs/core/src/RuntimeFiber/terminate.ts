import * as E from 'src/Either'
import * as Exit from '../Exit'

import { RuntimeFiber } from './fiber'

export const terminate = <Success, Failure>(
  fiber: RuntimeFiber<Success, Failure>,
) => {
  return (value: E.Either<Success, Failure>) => {
    fiber.status = 'closed'
    const exit = Exit.fromEither(value)
    fiber.result = exit
    fiber.listeners.forEach(([resolve]) => {
      resolve(exit)
    })
  }
}
