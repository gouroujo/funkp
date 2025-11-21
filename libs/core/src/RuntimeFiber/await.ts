import * as C from 'src/Channel'
import * as Exit from '../Exit'
import { RuntimeFiber } from './types'

export default function <Success, Failure>(
  fiber: RuntimeFiber<Success, Failure>,
): Promise<Exit.Exit<Success, Failure>> {
  return C.wait(fiber.channel).then((either) => {
    return Exit.fromEither(either)
  })
  // return new Promise<Exit<Success, Failure>>((resolve, reject) => {
  //   if ('result' in fiber) {
  //     return resolve(fiber.result)
  //   }
  //   fiber.listeners.push([resolve, reject])
  // })
}
