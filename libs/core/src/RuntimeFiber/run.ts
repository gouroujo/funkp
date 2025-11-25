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

function* effectToGenerator(ops: Op.Operation<any, any, any>[]) {
  let result
  for (const op of ops) {
    result = yield op
  }
  return result
}

function* main<Success, Failure>(
  ops: Iterator<
    | Op.Operation<Success, Failure, any>
    | YieldWrap<Effect.Effect<any, any, any>>
  >,
  channel: C.Channel<E.Either<unknown, unknown>>,
): Generator<
  C.Instruction<any>,
  E.Either<Success, Failure>,
  E.Either<unknown, unknown>
> {
  let current = ops.next()
  let result: E.Either<unknown, unknown> = E.right(current.value)
  while (!current.done) {
    const op = current.value
    console.log('RUN OP', op)
    if (isYieldWrap(op)) {
      const effect = yieldWrapGet(op)
      result = yield* main(effectToGenerator(effect.ops), channel)
      // console.log('YIELDWRAP DONE', result)
      current = E.isRight(result)
        ? ops.next(result.right)
        : ops.throw
          ? ops.throw(result.left)
          : ops.next()
      // if (current.done) {
      //   return E.right(current.value)
      // }
    } else {
      switch (op._op) {
        case Op.PURE_OP: {
          yield C.take(channel)
          result = yield C.put(channel, E.right(op.value))
          break
        }
        case Op.FAIL_OP: {
          yield C.take(channel)
          result = yield C.put(channel, E.left(op.failure))
          break
        }
        case Op.ON_SUCCESS_OP: {
          if (E.isRight(result)) {
            yield C.take(channel)
            const value = op.fn(result.right)
            result = yield C.put(
              channel,
              value instanceof Promise ? value.then(E.right) : E.right(value),
            )
          }
          break
        }
        case Op.ON_FAILURE_OP: {
          if (E.isLeft(result)) {
            yield C.take(channel)
            const value = op.fn(result.left)
            result = yield C.put(
              channel,
              value instanceof Promise ? value.then(E.left) : E.left(value),
            )
          }
          break
        }
        case Op.ASYNC_OP: {
          yield C.take(channel)
          result = yield C.put(
            channel,
            op
              .fn()
              .then(E.right)
              .catch(op.catchFn ? compose(op.catchFn, E.left) : E.left),
          )
          break
        }
        case Op.SLEEP_OP: {
          yield C.sleep(channel, op.ms)
          break
        }
        // case Op.FORK_OP: {
        //   const childFiber = fork(fiber, op.effect)
        //   // C.go(main, [childFiber])
        //   result = yield C.put(channel, E.right(childFiber))
        //   break
        // }
        case Op.UNFOLD_OP: {
          if (E.isRight(result)) {
            result = yield* main(
              (
                result.right as Effect.Effect<unknown, unknown, never>
              ).ops.values(),
              channel,
            )
          }
          break
        }
        case Op.ITERATE_OP: {
          result = yield* main(op.fn(), channel)
          break
        }
        default:
          absurd(op)
      }
      current = ops.next(result)
    }
  }
  return result as E.Either<Success, Failure>
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
