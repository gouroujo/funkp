// Effect implementation with generator-based do-notation support

import { absurd } from 'src/functions'

// 1. Effect type as a tagged union, with Iterable support for yield*.
export type Effect<Success, Failure = never, Requirements = never> =
  | Pure<Success>
  | Fail<Failure>
  | FlatMap<Success, Failure, Requirements>
  | Async<Success, Failure>
  | Gen<Success, Failure, Requirements>

interface Pure<Success> {
  _tag: 'Pure'
  value: Success
  [Symbol.iterator](): Iterator<Effect<Success, never, never>, Success>
}
interface Fail<Failure> {
  _tag: 'Fail'
  error: Failure
  [Symbol.iterator](): Iterator<Effect<never, Failure, never>, never>
}
interface FlatMap<Success, Failure, Requirements, PrevSuccess = any> {
  _tag: 'FlatMap'
  left: Effect<PrevSuccess, Failure, Requirements>
  f: (a: PrevSuccess) => Effect<Success, Failure, Requirements>
  [Symbol.iterator](): Iterator<Effect<Success, Failure, Requirements>, Success>
}
interface Async<Success, Failure> {
  _tag: 'Promise'
  promiseFn: () => Promise<Success>
  [Symbol.iterator](): Iterator<Effect<Success, Failure>, Success>
}
interface Gen<Success, Failure, Requirements> {
  _tag: 'Gen'
  gen: () => Generator<Effect<any, Failure, Requirements>, Success, any>
  [Symbol.iterator](): Iterator<Effect<Success, Failure, Requirements>, Success>
}

// 2. Smart constructors and Iterable implementation
function succeed<Success>(value: Success): Effect<Success, never, never> {
  return {
    _tag: 'Pure',
    value,
    *[Symbol.iterator](): Generator<Pure<Success>, Success> {
      return yield this
    },
  }
}
function fail<Failure>(error: Failure): Effect<never, Failure, never> {
  return {
    _tag: 'Fail',
    error,
    *[Symbol.iterator](): Generator<Fail<Failure>, never> {
      yield this
      absurd()
    },
  }
}
function flatMap<PrevSuccess, Success, Failure, Requirements>(
  fn: (value: PrevSuccess) => Effect<Success, Failure, Requirements>,
): (
  a: Effect<PrevSuccess, Failure, Requirements>,
) => Effect<Success, Failure, Requirements> {
  return (left: Effect<PrevSuccess, Failure, Requirements>) => ({
    _tag: 'FlatMap',
    left,
    f: fn,
    *[Symbol.iterator]() {
      return yield this
    },
  })
}
function promise<Success>(promiseFn: () => Promise<Success>): Effect<Success> {
  return {
    _tag: 'Promise',
    promiseFn,
    *[Symbol.iterator]() {
      return yield this
    },
  }
}
function gen<Success, Failure, Requirements>(
  genFn: () => Generator<Effect<any, Failure, Requirements>, Success, any>,
): Effect<Success, Failure, Requirements> {
  return {
    _tag: 'Gen',
    gen: genFn,
    *[Symbol.iterator]() {
      return yield this
    },
  }
}

// 3. Fiber implementation
type FiberStatus = 'Running' | 'Suspended' | 'Done'

let nextFiberId = 0
class Fiber<Success, Failure> {
  public status: FiberStatus = 'Running'
  public result: Success | undefined = undefined
  public error: any = undefined
  public readonly id: number = nextFiberId++
  private waiting: ((result: Success | undefined, error: Failure) => void)[] =
    []

  constructor(public readonly effect: Effect<Success, Failure, never>) {}

  run(): void {
    let current: Effect<any, any, never> = this.effect
    const stack: ((a: any) => Effect<any, Failure>)[] = []

    const resume = (val: any) => {
      try {
        while (true) {
          switch (current._tag) {
            case 'Pure':
              if (stack.length === 0) {
                this.status = 'Done'
                this.result = current.value
                this.notify()
                return
              } else {
                const f = stack.pop()!
                current = f(current.value)
                continue
              }
            case 'Fail':
              this.status = 'Done'
              this.error = current.error
              this.notify()
              return
            case 'FlatMap':
              stack.push(current.f)
              current = current.left
              continue
            case 'Promise':
              this.status = 'Suspended'
              current.promiseFn().then((res) => {
                this.status = 'Running'
                current = succeed(res)
                resume(res)
              })
              return
            case 'Gen': {
              const iterator = current.gen()
              const step = (input?: any): void => {
                let next
                try {
                  next = iterator.next(input)
                } catch (e) {
                  current = fail(e)
                  resume(undefined)
                  return
                }
                if (next.done) {
                  current = succeed(next.value)
                  resume(next.value)
                } else {
                  // next.value must be an Effect (and is Iterable)
                  const yielded: Effect<any> = isIterable(next.value)
                    ? next.value[Symbol.iterator]().next().value
                    : next.value
                  const child = new Fiber(yielded)
                  child.run()
                  child.await().then(
                    (res) => step(res),
                    (err) => {
                      current = fail(err)
                      resume(undefined)
                    },
                  )
                }
              }
              this.status = 'Suspended'
              step()
              return
            }
          }
        }
      } catch (e) {
        this.status = 'Done'
        this.error = e
        this.notify()
      }
    }

    resume(undefined)
  }

  await(): Promise<Success> {
    if (this.status === 'Done') {
      if (this.error !== undefined) return Promise.reject(this.error)
      return Promise.resolve(this.result as Success)
    }
    return new Promise<Success>((resolve, reject) => {
      this.waiting.push((result, error) => {
        if (error !== undefined) reject(error)
        else resolve(result as Success)
      })
    })
  }

  private notify() {
    this.waiting.forEach((cb) => cb(this.result, this.error))
    this.waiting = []
  }
}

// Utility
function isIterable(obj: any): obj is Iterable<any> {
  return !!obj && typeof obj[Symbol.iterator] === 'function'
}

// 4. Runtime
function runEffect<Success, Failure>(
  effect: Effect<Success, Failure>,
): Fiber<Success, Failure> {
  const fiber = new Fiber(effect)
  setImmediate(() => fiber.run())
  return fiber
}

// 5. Example usage

if (import.meta.vitest) {
  const { it, describe, expect } = import.meta.vitest

  it('should work', async () => {
    const program = gen(function* () {
      const a = yield* succeed(42)
      const b = yield* promise(
        () =>
          new Promise<number>((resolve) => setTimeout(() => resolve(10), 500)),
      )
      return a + b
    })
    const fiber = runEffect(program)
    const result = await fiber.await()
    expect(result).toBe(52)
  })
  it('should work with flatmap', async () => {
    const a = succeed(42)
    const b = flatMap((v: number) => succeed(v + 10))
    const program = b(a)
    const fiber = runEffect(program)
    const result = await fiber.await()
    expect(result).toBe(52)
  })
  it('should work with flatmap inside generator', async () => {
    const a = succeed(42)
    const b = flatMap((v: number) => succeed(v + 10))
    const program = gen(function* () {
      const result = yield* b(a)
      return result
    })
    const fiber = runEffect(program)
    const result = await fiber.await()
    expect(result).toBe(52)
  })
}

// A: Using gen and yield* for do-notation

// B: Simple effect
// const simple = flatMap(succeed(10), (x) => succeed(x + 5))
// runEffect(simple).await().then(console.log) // 15

// // C: Async effect only
// runEffect(asyncEffect((cb) => setTimeout(() => cb('async!'), 20)))
//   .await()
//   .then(console.log) // "async!"
