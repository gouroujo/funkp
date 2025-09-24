import { wait as waitChannel } from '../Channel'
import { Fiber } from './fiber'

export const wait = <Success, Failure>() => {
  return (fiber: Fiber<Success, Failure>) => {
    return waitChannel(fiber.channel)
  }
}
