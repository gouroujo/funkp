import * as C from 'src/Channel'
import * as Effect from 'src/Effect'
import * as E from 'src/Either'

import {
  isYieldWrap,
  YieldWrap,
  yieldWrapGet,
} from 'src/Effect/internal/yieldwrap'
import { absurd, compose } from 'src/functions'
import * as Op from 'src/RuntimeOp'
import { Runtime } from '../Runtime'
import { RuntimeFiber } from './types'

function* effectToGenerator<Success>(
  ops: ((v?: unknown) => Op.Operation)[],
): Generator<Op.Operation, Success, any> {
  let result
  for (const op of ops) {
    result = yield op(result)
  }
  return result
}

function* main<Success, Failure>(
  ops: Generator<
    | Op.Operation<Success, Failure, any>
    | YieldWrap<Effect.Effect<any, any, any>>
  >,
  channel: C.Channel<E.Either<unknown, unknown>>,
): Generator<
  C.Instruction<any>,
  E.Either<Failure, Success>,
  E.Either<unknown, unknown>
> {
  let current = ops.next()
  // let result: E.Either<unknown, unknown> = E.right()
  while (true) {
    if (current.done) {
      return current.value
    }

    if (isYieldWrap(current.value)) {
      const effect = yieldWrapGet(current.value)
      const result = yield* main(effectToGenerator(effect.ops), channel)
      current = E.isRight(result)
        ? ops.next(result.right)
        : ops.throw(result.left) // Stop execution on failure
      continue
    }

    if (Op.isOperation(current.value)) {
      const op = current.value
      switch (op._op) {
        case Op.PURE_OP: {
          yield C.take(channel)
          const result = yield C.put(channel, E.right(op.value))
          current = ops.next(result)
          break
        }
        case Op.FAIL_OP: {
          yield C.take(channel)
          const result = yield C.put(channel, E.left(op.failure))
          current = ops.next(result)

          break
        }
        case Op.ON_SUCCESS_OP: {
          if (E.isRight(op.value)) {
            yield C.take(channel)
            const value = op.fn(op.value.right)
            const result = yield C.put(
              channel,
              value instanceof Promise ? value.then(E.right) : E.right(value),
            )
            current = ops.next(result)
          } else {
            current = ops.next(op.value)
          }
          break
        }
        case Op.ON_FAILURE_OP: {
          if (E.isLeft(op.value)) {
            yield C.take(channel)
            const value = op.fn(op.value.left)
            const result = yield C.put(
              channel,
              value instanceof Promise ? value.then(E.left) : E.left(value),
            )
            current = ops.next(result)
          } else {
            current = ops.next(op.value)
          }
          break
        }
        case Op.ASYNC_OP: {
          yield C.take(channel)
          const result = yield C.put(
            channel,
            op
              .fn()
              .then(E.right)
              .catch(op.catchFn ? compose(op.catchFn, E.left) : E.left),
          )
          current = ops.next(result)
          break
        }
        case Op.SLEEP_OP: {
          yield C.sleep(channel, op.ms)
          current = ops.next(E.right())
          break
        }
        // case Op.FORK_OP: {
        //   const childFiber = fork(fiber, op.effect)
        //   // C.go(main, [childFiber])
        //   result = yield C.put(channel, E.right(childFiber))
        //   break
        // }
        // case Op.UNFOLD_OP: {
        //   if (E.isRight(result)) {
        //     result = yield* main(
        //       (
        //         result.right as Effect.Effect<unknown, unknown, never>
        //       ).ops.values(),
        //       channel,
        //     )
        //   }
        //   break
        // }
        case Op.ITERATE_OP: {
          try {
            const result = yield* main(op.fn(), channel)
            current = ops.next(E.right(result))
          } catch (error) {
            current = ops.next(E.left(error))
          }
          break
        }
        default:
          absurd(op)
      }
    }
  }
}

export const runLoop = <Success, Failure, Context>(
  fiber: RuntimeFiber<Success, Failure>,
  runtime: Runtime<Context>,
): RuntimeFiber<Success, Failure> => {
  C.go(
    function* (fiber: RuntimeFiber<Success, Failure>) {
      yield C.put(fiber.channel, E.right())
      const result = yield* main(
        effectToGenerator(fiber.effect.ops),
        fiber.channel,
      )
      C.close(fiber.channel, result)
    },
    [fiber],
  )
  return Object.assign(fiber, { status: 'running' })
}
