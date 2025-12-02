import * as Exit from '../Exit'
import { RuntimeFiber } from './types'

export const interrupt = <Success, Failure, Context>(
  fiber: RuntimeFiber<Success, Failure, Context>,
): Promise<void> => {
  fiber.status = 'interrupted'
  fiber.listeners.forEach(([resolve]) => resolve(Exit.interrupted(fiber)))
  return Promise.resolve()
}
