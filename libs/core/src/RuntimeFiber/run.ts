import { Either } from '../Either'
import { absurd } from '../functions'
import { Runtime } from '../Runtime'
import {
  ASYNC_OP,
  asyncHandler,
  failHandler,
  injectHandler,
  Operation,
  pureHandler,
  sleepHandler,
  syncHandler,
  YIELD_OP,
} from '../RuntimeOp'
import { terminate } from './terminate'
import { RuntimeFiber } from './types'

export const runLoop = <Success, Failure, Context>(
  fiber: RuntimeFiber<Success, Failure>,
  runtime: Runtime<Context>,
): RuntimeFiber<Success, Failure> => {
  const generator = fiber.effect[Symbol.iterator]()

  void (function _go(
    state: IteratorResult<Operation, Either<Failure, Success>>,
  ): void {
    if (state.done) return void terminate(fiber)(state.value)
    const next = (v?: any) => _go(generator.next(v))

    switch (state.value._op) {
      case 'sync':
        return void next(syncHandler(state.value))
      case 'pure':
        return void next(pureHandler(state.value))
      case 'fail':
        return void next(failHandler(state.value))
      case ASYNC_OP:
        return void asyncHandler(state.value).then((value) => next(value))
      case 'sleep':
        return void sleepHandler(state.value).then((value) => next(value))
      case 'inject':
        return void next(injectHandler(state.value, runtime))
      case YIELD_OP:
        return void setTimeout(() => next(), 0)
      default:
        absurd(state.value)
    }
  })(generator.next())

  return Object.assign(fiber, { status: 'running' })
}

type InstructionHandlers<Op extends (string | symbol)[]> = {
  [K in Op[number]]: (
    next: () => void,
    context: {
      runtime: Runtime<unknown>
      fiber: RuntimeFiber<unknown, unknown>
    },
  ) => void
}
const instructionAsync: InstructionHandlers<[typeof YIELD_OP]> = {
  [YIELD_OP]: (next) => void setTimeout(() => next(), 0),
}
