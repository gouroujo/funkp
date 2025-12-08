import { InterruptedError } from 'src/Fiber'
import * as Exit from '../Exit'
import { RuntimeFiber } from './fiber'

export const interrupt = <Success, Failure>(
  fiber: RuntimeFiber<Success, Failure>,
  error: InterruptedError,
): void => {
  if (fiber.status !== 'interrupted') {
    fiber.status = 'interrupted'
    if (fiber.childs) {
      fiber.childs.forEach((child) => interrupt(child, error))
    }
    if (fiber.parent) {
      interrupt(fiber.parent, error)
    }
    fiber.listeners.forEach(([resolve]) => resolve(Exit.fail(error)))
  }
}
