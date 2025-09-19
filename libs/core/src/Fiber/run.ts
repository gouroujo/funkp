import { gen } from '../Effect/constructors'
import { Either, isLeft, left, map, right } from '../Either'
import { absurd } from '../functions'
import { exit } from './exit'
import { Fiber } from './fiber'
import { forkFiber } from './fork'
import { wait } from './wait'

export function runFiber() {
  return <Success, Failure>(fiber: Fiber<Success, Failure>) => {
    setImmediate(() => _run(fiber))
    return fiber
  }
}

function _run<Success, Failure>(
  fiber: Fiber<Success, Failure>,
  prevValue?: Either<Failure, any>,
): Fiber<Success, Failure> {
  if (fiber.callStack.length === 0) {
    return exit<Success, Failure>(prevValue!)(
      Object.assign(fiber, { status: 'Done' }),
    )
  }
  if (prevValue && isLeft(prevValue)) {
    return exit<Success, Failure>(prevValue)(
      Object.assign(fiber, { status: 'Done' }),
    )
  }
  const current = fiber.callStack.pop()
  if (!current) return fiber
  const effect = current(prevValue?.right)
  switch (effect._tag) {
    case 'Pure':
      return _run(
        Object.assign(fiber, { status: 'Running' }),
        right(effect.value),
      )
    case 'Fail':
      return _run(
        Object.assign(fiber, { status: 'Running' }),
        left(effect.error),
      )
    case 'Map':
      fiber.callStack.push(() => effect.effect)
      return _run(
        Object.assign(fiber, { status: 'Running' }),
        map(effect.fn)(prevValue!),
      )
    case 'Flat':
      fiber.callStack.push(() => effect.effect)
      return _run(Object.assign(fiber, { status: 'Running' }), prevValue)
    case 'Promise':
      fiber.status = 'Suspended'
      effect
        .promiseFn(prevValue?.right)
        .then((res) =>
          _run(Object.assign(fiber, { status: 'Running' }), right(res)),
        )
      return fiber
    case 'Gen': {
      const iterator = effect.gen()
      const next = iterator.next(prevValue?.right)
      if (next.done) {
        return _run(
          Object.assign(fiber, { status: 'Running' }),
          right(next.value),
        )
      }
      const yielded = next.value
      const child = forkFiber(yielded)(fiber)
      setImmediate(() => _run(child))
      wait()(child).then((res) => {
        fiber.callStack.push(() => gen(() => iterator))
        _run(Object.assign(fiber, { status: 'Running' }), right(res))
      })
      return fiber
    }
    default:
      absurd(effect)
  }
}
