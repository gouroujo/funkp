import { go } from '../Channel'
import { Fiber } from './fiber'

export const runFiber =
  <Success, Failure>() =>
  (fiber: Fiber<Success, Failure>) => {
    const generator = fiber.effect[Symbol.iterator]()
    go(generator, fiber.channel)
    return fiber
  }
