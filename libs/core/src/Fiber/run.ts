import { absurd } from 'src/functions'
import { Either } from '../Either'
import { curryLeft } from '../utils/function/curry'
import type { Fiber } from './fiber'
import { INJECT_FIBER } from './inject'
import {
  forkHandler,
  Instruction,
  sleepHandler,
  waitHandler,
} from './instructions'

export const runFiber =
  <Success, Failure>() =>
  (fiber: Fiber<Success, Failure>) => {
    const generator = fiber.effect[Symbol.iterator]()

    ;(function _run(
      generator: Iterator<Instruction, Either<Failure, Success>>,
      prevValue?: unknown,
    ) {
      if (fiber.status === 'closed') {
        fiber.listeners.forEach(([_, reject]) => reject('fiber is closed'))
        return
      }
      const state = generator.next(prevValue)
      const next = curryLeft(_run, generator)
      if (!state.done) {
        const instruction = state.value
        switch (instruction._tag) {
          case 'wait':
            waitHandler(next, instruction.value, fiber)
            break
          case 'pure':
            setImmediate(() => next(instruction.value))
            break
          case 'fork': {
            forkHandler(next, instruction.value, fiber)
            break
          }
          case 'inject': {
            switch (instruction.value) {
              case INJECT_FIBER:
                setImmediate(() => next(fiber))
                break
              default:
                setImmediate(() =>
                  next(fiber.context.services?.get(instruction.value)),
                )
            }
            break
          }
          case 'sleep':
            sleepHandler(next, instruction.value, fiber)
            break
          case 'interrupt': {
            break
          }
          default:
            absurd(instruction)
        }
      } else {
        fiber.listeners.forEach(([resolve]) => resolve(state.value))
      }
    })(generator)

    return fiber
  }
