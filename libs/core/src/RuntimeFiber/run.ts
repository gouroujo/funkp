import * as C from 'src/Channel'
import * as E from 'src/Either'
import { absurd, compose } from 'src/functions'
import * as Op from 'src/RuntimeOp'
import { Runtime } from '../Runtime'
import { fork } from './fork'
import { RuntimeFiber } from './types'

function* main<Success, Failure>(
  fiber: RuntimeFiber<Success, Failure>,
): Generator<C.Instruction, void, E.Either<any, any>> {
  const channel = fiber.channel
  let result: E.Either<any, any> = E.right()
  for (const op of fiber.effect.ops) {
    switch (op._op) {
      case Op.PURE_OP: {
        result = yield C.put(channel, E.right(op.value))
        continue
      }
      case Op.FAIL_OP: {
        result = yield C.put(channel, E.left(op.failure))
        continue
      }
      case Op.ON_SUCCESS_OP: {
        const value = yield C.take(channel)
        result = yield C.put(channel, E.mapRight(op.fn)(value))
        continue
      }
      case Op.ON_FAILURE_OP: {
        const value = yield C.take(channel)
        result = yield C.put(channel, E.mapLeft(op.fn)(value))
        continue
      }
      case Op.ASYNC_OP: {
        result = yield C.put(
          channel,
          op
            .fn()
            .then(E.right)
            .catch(op.catchFn ? compose(op.catchFn, E.left) : E.left),
        )
        continue
      }
      case Op.SLEEP_OP: {
        yield C.sleep(channel, op.ms)
        continue
      }
      case Op.FORK_OP: {
        const childFiber = fork(fiber, op.effect)
        C.go(main, [childFiber])
        result = yield C.put(channel, E.right(childFiber))
        continue
      }
      case Op.DELEGATE_OP: {
        const value = yield C.take(channel)
        if (E.isRight(value)) {
          // yield* main(fiber, value.right)
        }
        result = yield C.put(channel, value)
        continue
      }
      default:
        absurd(op)
    }
  }
  C.close(channel, result)
}

export const runLoop = <Success, Failure, Context>(
  fiber: RuntimeFiber<Success, Failure>,
  runtime: Runtime<Context>,
): RuntimeFiber<Success, Failure> => {
  C.go(main, [fiber])
  return Object.assign(fiber, { status: 'running' })
}
