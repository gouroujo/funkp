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
import { Runtime } from '../Runtime'
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

function* main<Success, Failure>(
  ops: Generator<
    | Op.Operation<Success, Failure, any>
    | YieldWrap<Effect.Effect<any, any, any>>
  >,
  fiber: RuntimeFiber<Success, Failure>,
): Generator<C.Instruction<any>, E.Either<Failure, Success>, unknown> {
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
          })
          // TODO : Improve channel to use tokens and type the channel.close method with wait
          C.go(
            function* (
              channel: C.Channel<unknown>,
              effects: Effect.Effect<any, any, any>[],
              rootFiber: RuntimeFiber<Success, Failure>,
            ) {
              const results: E.Either<any, any>[] = []
              for (let i = 0; i < effects.length; i++) {
                const effect = effects[i]
                const token = yield C.take(channel)
                const childFiber = fork(rootFiber, effect)
                yield C.put(childFiber.channel, true)
                const r = yield* main(effectToGenerator(effect.ops), childFiber)
                results[i] = r
                yield C.put(channel, token)
              }
              C.close(concurrencyChannel, E.all(results))
            },
            [concurrencyChannel, op.effects, fiber],
          )
          yield C.put(concurrencyChannel, true) // TODO: should be concurrency times
          const result = yield C.put(fiber.channel, C.wait(concurrencyChannel))
          current = ops.next(result)
          break
        }
        case Op.SLEEP_OP: {
          yield C.sleep(fiber.channel, op.ms)
          current = ops.next(E.right())
          break
        }
        case Op.FORK_OP: {
          const childFiber = fork(fiber, op.effect)
          // C.go(main, [childFiber])
          yield C.put(fiber.channel, E.right(childFiber))
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
  fiber: RuntimeFiber<Success, Failure>,
  runtime: Runtime<Context>,
): RuntimeFiber<Success, Failure> => {
  C.go(
    function* (fiber: RuntimeFiber<Success, Failure>) {
      yield C.put(fiber.channel, E.right())
      const result = yield* main(effectToGenerator(fiber.effect.ops), fiber)
      C.close(fiber.channel, result)
    },
    [fiber],
  )
  return Object.assign(fiber, { status: 'running' })
}
