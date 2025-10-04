import { absurd } from 'src/functions'
import { Either } from '../Either'
import type { Fiber } from './fiber'
import { forkFiber } from './fork'
import { INJECT_FIBER } from './inject'
import { Instruction } from './instructions'

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
      if (!state.done) {
        const instruction = state.value
        switch (instruction._action) {
          case 'wait':
            {
              const promise = instruction.value
              promise.then((v) => setImmediate(() => _run(generator, v)))
              // .catch((e) => generator.throw && run(generator.throw(e)))
            }
            break
          case 'pure':
            setImmediate(() => _run(generator, instruction.value))
            break
          case 'fork': {
            const child = forkFiber(instruction.value)(fiber)
            setImmediate(() => _run(generator, child))
            break
          }
          case 'inject': {
            switch (instruction.value) {
              case INJECT_FIBER:
                setImmediate(() => _run(generator, fiber))
                break
              default:
                setImmediate(() =>
                  _run(
                    generator,
                    fiber.context.services?.get(instruction.value),
                  ),
                )
            }
            break
          }
          case 'stop': {
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
