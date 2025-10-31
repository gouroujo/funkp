import * as Exit from '../Exit'
import { Runtime } from '../Runtime'
import { Operation } from '../RuntimeOp'
import { handlers } from './operation'
import { terminate } from './terminate'
import { RuntimeFiber } from './types'

export const runLoop = <Success, Failure, Context>(
  fiber: RuntimeFiber<Success, Failure>,
  runtime: Runtime<Context>,
): RuntimeFiber<Success, Failure> => {
  const generator = fiber.effect[Symbol.iterator]()

  void (function _go(state: IteratorResult<Operation, Success>): void {
    if (state.done) return void terminate(fiber)(Exit.succeed(state.value))
    const op = state.value
    // console.log('RUN LOOP OP', op)
    try {
      return void handlers[op._op](
        op as unknown as any,
        {
          next: (nextValue) => _go(generator.next(nextValue)),
          fail: (error) => _go(generator.throw(error)),
          exit: (value) => _go(generator.return(value)),
        },
        {
          runtime,
          fiber,
        },
      )
    } catch (error) {
      return void terminate(fiber)(Exit.fail(error))
    }
  })(generator.next())

  return Object.assign(fiber, { status: 'running' })
}
