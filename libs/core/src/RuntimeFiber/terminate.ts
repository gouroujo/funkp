import * as Exit from '../Exit'
import { RuntimeFiber } from './types'

export const terminate = <Success, Failure, Context>(
  fiber: RuntimeFiber<Success, Failure, Context>,
) => {
  return (result: Exit.Exit<Success, Failure>) => {
    fiber.status = 'closed'

    fiber.result = result
    fiber.listeners.forEach(([resolve, reject]) => {
      resolve(result)
    })
  }
}
