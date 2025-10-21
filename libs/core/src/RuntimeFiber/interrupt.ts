import { Exit } from '../Exit'
import wait from './await'
import { RuntimeFiber } from './types'

export const interrupt = <Success, Failure>(
  fiber: RuntimeFiber<Success, Failure>,
): Promise<Exit<Success, Failure>> => {
  fiber.status = 'interrupted'
  return wait(fiber)
}
