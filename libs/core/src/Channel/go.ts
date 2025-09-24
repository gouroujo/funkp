import { Instruction } from '.'
import { absurd } from '../functions'
import {
  asyncHandler,
  putHandler,
  sleepHandler,
  takeHandler,
} from './operations'

const go_ = <T>(
  generator: Generator<Instruction<T>, unknown, T | null>,
  state?: T | null,
) => {
  const step = state ? generator.next(state) : generator.next()
  if (!step.done) {
    const instruction = step.value
    switch (instruction._tag) {
      case 'take': {
        const { channel } = instruction
        takeHandler(channel, (value) =>
          setImmediate(() => go_(generator, value)),
        )
        break
      }
      case 'put': {
        const { channel, value } = instruction
        putHandler(channel, value, (value) =>
          setImmediate(() => go_(generator, value)),
        )
        break
      }
      case 'async': {
        const { channel, promise } = instruction
        asyncHandler(channel, promise, () => setImmediate(() => go_(generator)))
        break
      }
      case 'sleep': {
        const { channel, ms } = instruction
        sleepHandler(channel, ms, () => setImmediate(() => go_(generator)))
        break
      }
      default: {
        absurd(instruction)
      }
    }
  }
}

export const go = <T, A extends unknown[] = never[]>(
  genFn: (...args: A) => Generator<Instruction<T>, unknown, T | null>,
  args: A,
) => {
  go_(genFn(...args))
}
