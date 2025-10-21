import { Either } from '../Either'
import { absurd } from '../functions'
import { Runtime } from '../Runtime'
import {
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
    switch (state.value._op) {
      case 'sync':
        return void _go(generator.next(syncHandler(state.value)))
      case 'pure':
        return void _go(generator.next(pureHandler(state.value)))
      case 'fail':
        return void _go(generator.next(failHandler(state.value)))
      case 'async':
        return void asyncHandler(state.value).then((value) =>
          _go(generator.next(value)),
        )
      case 'sleep':
        return void sleepHandler(state.value).then((value) =>
          _go(generator.next(value)),
        )
      case 'inject':
        return void _go(generator.next(injectHandler(state.value, runtime)))
      case YIELD_OP:
        return void setTimeout(() => _go(generator.next()), 0)
      default:
        absurd(state.value)
    }
  })(generator.next())

  return Object.assign(fiber, { status: 'running' })
}
