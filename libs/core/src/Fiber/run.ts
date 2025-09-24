import { Channel, ChannelFn, close, go } from '../Channel'
import * as E from '../Either'
import { Fiber } from './fiber'

export const runFiber =
  <Success, Failure>() =>
  (fiber: Fiber<Success, Failure>) => {
    go(
      function* (channel): ChannelFn<Channel<E.Either<Failure, any>>> {
        yield* fiber.effect(channel)
        close(fiber.channel)
      },
      [fiber.channel],
    )
    return fiber
  }
