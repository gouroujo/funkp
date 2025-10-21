import { Exit } from '../Exit'
import { RuntimeFiber } from './types'

export default function <Success, Failure>(
  fiber: RuntimeFiber<Success, Failure>,
) {
  return new Promise<Exit<Success, Failure>>((resolve, reject) => {
    if ('result' in fiber) {
      return resolve(fiber.result)
    }
    fiber.listeners.push([resolve, reject])
  })
}
