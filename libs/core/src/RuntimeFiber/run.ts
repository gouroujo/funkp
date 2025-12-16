import * as C from 'src/Channel'
import * as Effect from 'src/Effect'
import * as E from 'src/Either'
import * as Exit from 'src/Exit'

import { isYieldWrap, yieldWrapGet } from 'src/Effect/internal/yieldwrap'
import { InterruptedError, MissingDependencyError } from 'src/Fiber'
import { absurd, compose } from 'src/functions'
import * as Op from 'src/RuntimeOp'
import wait from './await'
import { ExitType, RuntimeFiber } from './fiber'
import { fork } from './fork'
import { interrupt } from './interrupt'

function* effectToGenerator<Success, Failure>(
  effect: Effect.Effect<Success, Failure, unknown>,
): Generator<Op.Operation, E.Either<Failure, Success>, E.Either> {
  let result
  for (const op of effect.ops) {
    result = yield op(result)
  }
  return result as E.Either<Failure, Success>
}

function* main<Success, Failure>(
  fiber: RuntimeFiber<Success, Failure>,
): Generator<C.Instruction<string>, void, any> {
  const ops = effectToGenerator(fiber.effect)
  let current = ops.next()
  while (!current.done) {
    if (Op.isOperation(current.value)) {
      const op = current.value
      // console.log('OP', op)
      switch (op._op) {
        case Op.PURE_OP: {
          const token = yield C.take(fiber.channel)
          current = ops.next(E.right(op.value))
          yield C.put(fiber.channel, token)
          break
        }
        case Op.FAIL_OP: {
          const token = yield C.take(fiber.channel)
          current = ops.next(E.left(op.failure))
          yield C.put(fiber.channel, token)
          break
        }
        case Op.ON_SUCCESS_OP: {
          if (E.isRight(op.value)) {
            const token = yield C.take(fiber.channel)
            const childFiber = runLoop(fork(fiber, op.fn(op.value.right)))
            const result: ExitType<typeof childFiber> = yield C.wait(
              fiber.channel,
              wait(childFiber),
            )
            current = ops.next(Exit.toEither(result))
            yield C.put(fiber.channel, token)
          } else {
            current = ops.next(op.value)
          }
          break
        }
        case Op.ON_FAILURE_OP: {
          if (E.isLeft(op.value)) {
            const token = yield C.take(fiber.channel)
            const childFiber = runLoop(fork(fiber, op.fn(op.value.left)))
            const result: ExitType<typeof childFiber> = yield C.wait(
              fiber.channel,
              wait(childFiber),
            )
            current = ops.next(Exit.toEither(result))
            yield C.put(fiber.channel, token)
          } else {
            current = ops.next(op.value)
          }
          break
        }
        case Op.ASYNC_OP: {
          const token = yield C.take(fiber.channel)
          const result = yield C.wait(
            fiber.channel,
            op
              .fn()
              .then(E.right)
              .catch(op.catchFn ? compose(op.catchFn, E.left) : E.left),
          )
          current = ops.next(result)
          yield C.put(fiber.channel, token)
          break
        }
        case Op.PARALLEL_OP: {
          const token = yield C.take(fiber.channel)
          const concurrencyChannel = C.chan<unknown>(op.concurrency, {
            strategy: 'fixed',
            fill: true,
          })
          const promises: Promise<E.Either>[] = []
          for (let i = 0; i < op.effects.length; i++) {
            const effect = op.effects[i]
            const childFiber = fork(fiber, effect)
            // run each fiber separetly
            C.go(
              function* (c, childFiber) {
                const token = yield C.take(c) // maybe we can put first and take when done
                runLoop(childFiber)
                yield C.wait(c, wait(childFiber))
                yield C.put(c, token)
              },
              [concurrencyChannel, childFiber],
            )
            promises[i] = wait(childFiber).then(Exit.toEither)
          }
          const result = yield C.wait(
            fiber.channel,
            Promise.all(promises).then(E.all),
          )
          current = ops.next(result)
          yield C.put(fiber.channel, token)
          break
        }
        case Op.SLEEP_OP: {
          yield C.sleep(fiber.channel, op.ms)
          current = ops.next(E.right())
          break
        }
        case Op.FORK_OP: {
          const token = yield C.take(fiber.channel)
          const childFiber = runLoop(fork(fiber, op.effect))
          current = ops.next(E.right(childFiber))
          yield C.put(fiber.channel, token)
          break
        }
        case Op.INTERRUPT_OP: {
          ops.throw(new InterruptedError())
          break
        }
        case Op.ITERATE_OP: {
          const token = yield C.take(fiber.channel)
          try {
            const gen = op.fn(op.prevValue)
            let el = gen.next()
            while (!el.done) {
              if (isYieldWrap(el.value)) {
                const value = yieldWrapGet(el.value)
                if (Effect.isEffect(value)) {
                  const childFiber = runLoop(fork(fiber, value))
                  const result: ExitType<typeof childFiber> = yield C.wait(
                    fiber.channel,
                    wait(childFiber),
                  )
                  el = Exit.isSuccess(result)
                    ? gen.next(result.success)
                    : gen.throw(result.failure) // Stop execution on failure
                } else {
                  const context = fiber.runtime.context
                  if (context.services.has(value)) {
                    el = gen.next(context.services.get(value))
                  } else {
                    el = gen.throw(new MissingDependencyError(value))
                  }
                }
              } else {
                el = gen.next(el.value)
              }
            }
            // const result = yield* main(op.fn(op.prevValue), fiber)
            current = ops.next(E.right(el.value))
          } catch (error) {
            current = ops.next(E.left(error))
          }
          yield C.put(fiber.channel, token)

          break
        }
        case Op.INJECT_OP: {
          console.log(op)
          const context = fiber.runtime.context
          if (context.services.has(op.token)) {
            current = ops.next(E.right(context.services.get(op.token)))
          } else {
            current = ops.throw(new MissingDependencyError(op.token))
          }
          break
        }
        default:
          absurd(op)
      }
    }
  }
  // console.log('close', fiber.id, current.value)
  C.close(fiber.channel, current.value)
}

export const runLoop = <Success, Failure>(
  fiber: RuntimeFiber<Success, Failure>,
): RuntimeFiber<Success, Failure> => {
  try {
    C.go(main, [fiber])
  } catch (error) {
    if (error instanceof InterruptedError) {
      interrupt(fiber, error)
    }
    if (error instanceof MissingDependencyError) {
      interrupt(fiber, error)
    }
    console.error('error catched in runloop', error)
  }
  return Object.assign(fiber, { status: 'running' })
}
