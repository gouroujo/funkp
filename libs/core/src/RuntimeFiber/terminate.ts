import * as Exit from '../Exit'
import { RuntimeFiber } from './types'

export const terminate = <Success, Failure>(
  fiber: RuntimeFiber<Success, Failure>,
) => {
  return (result: Exit.Exit<Success, Failure>) => {
    fiber.status = 'closed'

    fiber.result = result
    fiber.listeners.forEach(([resolve, reject]) => {
      resolve(result)
    })
  }
}
