import { absurd } from 'src/functions'
import * as Exit from '../Exit'
import { RuntimeFiber } from './fiber'

export default async function <Success, Failure>(
  fiber: RuntimeFiber<Success, Failure>,
): Promise<Exit.Exit<Success, Failure>> {
  // const result = await C.wait(fiber.channel)
  // return Exit.fromEither(result)
  switch (fiber.status) {
    case 'closed':
      return Promise.resolve(fiber.result!)
    case 'interrupted':
      return Promise.reject(Exit.interrupted(fiber))
    case 'running':
    case 'suspended':
      return new Promise((resolve, reject) => {
        fiber.listeners.push([resolve, reject])
      })
    default:
      absurd(fiber.status)
  }
  // return new Promise<Exit<Success, Failure>>((resolve, reject) => {
  //   if ('result' in fiber) {
  //     return resolve(fiber.result)
  //   }
  //   fiber.listeners.push([resolve, reject])
  // })
}
