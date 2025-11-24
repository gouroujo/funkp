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
  let result: E.Either<unknown, unknown> = E.right()
  let current = ops.next()
  while (!current.done) {
    const op = current.value
    console.log('RUN OP', op)
    if (isYieldWrap(op)) {
      const effect = yieldWrapGet(op)
      result = yield* main(effect.ops.values(), channel)
      console.log('YIELDWRAP DONE', result)
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
          console.log('ON_SUCCESS_OP', result)
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
          console.log('ITERATE DONE', result)
          break
        }
        default:
          absurd(op)
      }
    }
    current = ops.next(result)
    console.log('NEXT OP', current)
    if (current.done) {
      return current.value
    }
  }
  console.log('EFFECT DONE', result)
  return result as E.Either<Success, Failure>
}

export const runLoop = <Success, Failure, Context>(
  fiber: RuntimeFiber<Success, Failure>,
  runtime: Runtime<Context>,
): RuntimeFiber<Success, Failure> => {
  C.go(
    function* (fiber: RuntimeFiber<Success, Failure>) {
      yield C.put(fiber.channel, E.right())
      const result = yield* main(fiber.effect[Symbol.iterator](), fiber.channel)
      C.close(fiber.channel, result)
    },
    [fiber],
  )
  return Object.assign(fiber, { status: 'running' })
}
