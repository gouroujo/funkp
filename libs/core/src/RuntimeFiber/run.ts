import * as C from 'src/Channel'
import * as Effect from 'src/Effect'
import * as E from 'src/Either'

import {
  isYieldWrap,
  YieldWrap,
  yieldWrapGet,
} from 'src/Effect/internal/yieldwrap'
import { InterruptedError } from 'src/Fiber'
import { absurd, compose } from 'src/functions'
import * as Op from 'src/RuntimeOp'
import { fork } from './fork'
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

function* main(
  ops: Generator<
    Op.Operation<any, any, any> | YieldWrap<Effect.Effect<any, any, any>>
  >,
  fiber: RuntimeFiber<any, any, any>,
): Generator<C.Instruction<any>, E.Either<any, any>, unknown> {
  let current = ops.next()
  // let result: E.Either<unknown, unknown> = E.right()
  while (true) {
    if (current.done) {
      return current.value
    }

    if (isYieldWrap(current.value)) {
      const effect = yieldWrapGet(current.value)
      const result = yield* main(effectToGenerator(effect.ops), fiber)
      current = E.isRight(result)
        ? ops.next(result.right)
        : ops.throw(result.left) // Stop execution on failure
      continue
    }

    if (Op.isOperation(current.value)) {
      const op = current.value
      console.log('OP', op)
      switch (op._op) {
        case Op.PURE_OP: {
          yield C.take(fiber.channel)
          const result = yield C.put(fiber.channel, E.right(op.value))
          current = ops.next(result)
          break
        }
        case Op.FAIL_OP: {
          yield C.take(fiber.channel)
          const result = yield C.put(fiber.channel, E.left(op.failure))
          current = ops.next(result)

          break
        }
        case Op.ON_SUCCESS_OP: {
          if (E.isRight(op.value)) {
            const effect: any = op.fn(op.value.right)
            const result = yield* main(effectToGenerator(effect.ops), fiber)
            current = ops.next(result)
          } else {
            current = ops.next(op.value)
          }
          break
        }
        case Op.ON_FAILURE_OP: {
          if (E.isLeft(op.value)) {
            const effect: any = op.fn(op.value.left)
            const result = yield* main(effectToGenerator(effect.ops), fiber)
            current = ops.next(result)
          } else {
            current = ops.next(op.value)
          }
          break
        }
        case Op.ASYNC_OP: {
          yield C.take(fiber.channel)
          const result = yield C.put(
            fiber.channel,
            op
              .fn()
              .then(E.right)
              .catch(op.catchFn ? compose(op.catchFn, E.left) : E.left),
          )
          current = ops.next(result)
          break
        }
        case Op.PARALLEL_OP: {
          yield C.take(fiber.channel)
          const concurrencyChannel = C.chan<unknown>(op.concurrency, {
            strategy: 'fixed',
            fill: true,
          })
          const promises: Promise<E.Either<any, any>>[] = []
          for (let i = 0; i < op.effects.length; i++) {
            const effect = op.effects[i]
            // Fork each effect in it's own fiber
            const childFiber = fork(fiber, effect)
            // run each fiber separetly
            C.go(
              function* (c, f) {
                yield C.take(c) // maybe we can put first and take when done
                runLoop(f)
                yield C.put(c, C.wait(f.channel))
              },
              [concurrencyChannel, childFiber],
            )
            promises[i] = C.wait(childFiber.channel)
          }
          const result = yield C.put(
            fiber.channel,
            Promise.all(promises).then(E.all),
          )
          current = ops.next(result)
          break
        }
        case Op.SLEEP_OP: {
          yield C.sleep(fiber.channel, op.ms)
          current = ops.next(E.right())
          break
        }
        case Op.FORK_OP: {
          yield C.take(fiber.channel)
          const childFiber = runLoop(fork(fiber, op.effect))
          current = ops.next(E.right(childFiber))
          yield C.put(fiber.channel, true)
          break
        }
        case Op.INTERRUPT_OP: {
          ops.throw(new InterruptedError())
          break
        }
        case Op.ITERATE_OP: {
          try {
            const result = yield* main(op.fn(op.prevValue), fiber)
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
  fiber: RuntimeFiber<Success, Failure, Context>,
): RuntimeFiber<Success, Failure, Context> => {
  C.go(
    function* (fiber: RuntimeFiber<Success, Failure, Context>) {
      yield C.put(fiber.channel, E.right())
      const result = yield* main(effectToGenerator(fiber.effect.ops), fiber)
      C.close(fiber.channel, result)
    },
    [fiber],
  )
  return Object.assign(fiber, { status: 'running' })
}
