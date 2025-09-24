import { Either as E } from '../main'

type Observer<Success> = (value: Success, elapsed: number) => void

type Fiber<Success, Failure = never> = {
  effect: Effect<Success, Failure, never>
  observer: Observer<Success> | undefined
  _onDone: Array<(value: E.Either<Failure, Success>) => void>
}

function createFiber<Success, Failure = never>(
  effect: Effect<Success, Failure, never>,
  opts?: { observer?: Observer<Success> },
): Fiber<Success, Failure> {
  return {
    effect,
    observer: opts?.observer,
    _onDone: [],
  }
}

function runFiber<Success, Failure = never>(
  fiber: Fiber<Success, Failure>,
): void {
  const start = Date.now()
  const iter = fiber.effect[Symbol.iterator]()
  
  let r = iter.next()
  while (!r.done) {
    const acc = r.value.fn()
    r = iter.next(acc)
  }
  elapsed = Date.now() - start
  fiber.observer?.(last, elapsed)
  fiber._onDone.forEach((cb) => cb(last))
}

function runPromise<Success, Failure = never>(
  fiber: Fiber<Success, Failure>,
): Promise<Success> {
  return new Promise((resolve) => {
    fiber._onDone.push(resolve)
    setTimeout(() => runFiber(fiber), 0)
  })
}

type Instruction = MapInstruction<any, any>

type MapInstruction<In, Out> = {
  fn: (value: In) => Out
}

type Effect<Success, Failure = never, Requirements = never> = {
  buffer: Instruction[]
  [Symbol.iterator](): Generator<Instruction, Success, any>
}

// function createEffect(initialBuffer: Operation[]): Effect<number> {
//   return {
//     buffer: initialBuffer,
//     [Symbol.iterator]: function* (): Generator<Operation, number, number> {
//       let value = 0
// while (true) {
//   if (this.buffer.length === 0) {
//     return value
//   }
//   const op = this.buffer.shift()!
//   value = yield op
//       }
//     },
//   }
// }

function gen<Success, Failure, Requirements>(
  genFn: () => Generator<Instruction, Success, any>,
): Effect<Success, Failure, Requirements> {
  return {
    buffer: [],
    *[Symbol.iterator]() {
      let value = yield* genFn()
      while (true) {
        if (this.buffer.length === 0) {
          return value
        }
        const op = this.buffer.shift()!
        value = yield op
      }
    },
  }
}

if (import.meta.vitest) {
  const { it, describe, expect, vi } = import.meta.vitest
  describe('test', () => {
    it('should work', async () => {
      // eslint-disable-next-line require-yield
      const effect1 = gen(function* () {
        return 'hello' as const
      })

      const effect = gen(function* () {
        const result = yield* effect1
        return result
      })
      const observer = vi.fn()
      const fiber = createFiber(effect, { observer })
      const result = await runPromise(fiber)
      expect(result).toEqual(5)
    })
  })
}
