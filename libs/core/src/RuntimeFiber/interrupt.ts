import * as Exit from '../Exit'
import { RuntimeFiber } from './types'

export const interrupt = <Success, Failure>(
  fiber: RuntimeFiber<Success, Failure>,
): Promise<void> => {
  fiber.status = 'interrupted'
  fiber.listeners.forEach(([resolve]) => resolve(Exit.interrupted(fiber)))
  return Promise.resolve()
}
