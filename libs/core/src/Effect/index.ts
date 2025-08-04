/* eslint-disable require-yield */

import { Either, isLeft, left, Left, right } from '../Either'

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface Effect<Success, Error = never, Requirements = never> {
  // effect: () => Generator<Success>
  _tag: 'effect'
  [Symbol.asyncIterator]: () => AsyncGenerator<Left<Error>, Success, any>
}
export interface SyncEffect<Success, Error = never, Requirements = never>
  extends Effect<Success, Error, Requirements> {
  [Symbol.iterator]: () => Generator<Left<Error>, Success, any>
}

type GeneratorYield<T extends Generator> =
  T extends Generator<infer Y, any, any> ? Y : never
type FilterEffect<T> = T extends Effect<any, any, any> ? T : never

export type Success<T extends Effect<any, any, any>> =
  T extends Effect<infer S, any, any> ? S : never
type Error<T extends Effect<any, any, any>> =
  T extends Effect<any, infer E, any> ? E : never
type Context<T extends Effect<any, any, any>> =
  T extends Effect<any, any, infer C> ? C : never

type Requirement = {
  _tag: 'requirement'
  value: any
}

const effect1: SyncEffect<'effect1', never, never> = {
  _tag: 'effect' as const,
  *[Symbol.iterator]() {
    return 'effect1' as const
  },
  async *[Symbol.asyncIterator]() {
    return 'effect1' as const
  },
}

const effect2: SyncEffect<'effect2', 'failure', 'context'> = {
  _tag: 'effect' as const,
  *[Symbol.iterator]() {
    return 'effect2' as const
  },
  async *[Symbol.asyncIterator]() {
    return 'effect2' as const
  },
}

function gen<Success, Failure>(
  genFn: () => Generator<Left<Failure>, Success, never>,
): SyncEffect<Success, Failure> {
  return {
    _tag: 'effect',
    [Symbol.iterator]: genFn,
    [Symbol.asyncIterator]: async function* () {
      const iterator = genFn()
      let result = iterator.next()
      while (!result.done) {
        if (isLeft(result.value)) {
          yield result.value
        } else {
          yield left(result.value)
        }
        result = iterator.next()
      }
      return result.value
    },
  }
}
function asyncgen<Success, Failure>(
  genFn: () => AsyncGenerator<Left<Failure>, Awaited<Success>, never>,
): Effect<Success, Failure> {
  return {
    _tag: 'effect',
    [Symbol.asyncIterator]: genFn,
  }
}

const effect3 = gen(function* () {
  const a = yield* effect1
  const b = yield* effect2
  return `Combined: ${a}, ${b}` as const
})

function fail<E>(error: E): SyncEffect<never, E, never> {
  return gen(function* () {
    return yield left(error)
  })
}

function succeed<T>(value: T): SyncEffect<T, never, never> {
  return gen(function* () {
    return value
  })
}

function promise<Success>(
  promiseFn: () => Promise<Success>,
): Effect<Success, never, never> {
  return asyncgen(async function* () {
    const result = await promiseFn()
    const c = yield* succeed(42)
    return result
  })
}

function runSync<Success, Failure>(
  effect: SyncEffect<Success, Failure, never>,
): Either<Failure, Success> {
  const iterator = effect[Symbol.iterator]()
  let result = iterator.next()
  while (!result.done) {
    if (isLeft(result.value)) {
      return result.value
    }
    result = iterator.next(result.value)
  }
  return right(result.value)
}
function runAsync<Success, Failure>(
  effect: Effect<Success, Failure, never>,
): Promise<Either<Failure, Success>> {
  const iterator = effect[Symbol.asyncIterator]()
  return (async () => {
    let result = await iterator.next()
    while (!result.done) {
      if (isLeft(result.value)) {
        return result.value
      }
      result = await iterator.next(result.value)
    }
    return right(result.value)
  })()
}

if (import.meta.vitest) {
  const { describe, it, expect } = import.meta.vitest

  describe('Synchronous Effect', () => {
    it('should run sync', () => {
      const result = runSync(effect3)
      expect(result).toEqual({
        _tag: 'Right',
        right: 'Combined: effect1, effect2',
      })
    })

    it('should succeed with value', () => {
      const result = runSync(succeed(42))
      expect(result).toEqual({ _tag: 'Right', right: 42 })
    })
    it('should fail with error', () => {
      const result = runSync(fail('error'))
      expect(result).toEqual({ _tag: 'Left', left: 'error' })
    })
  })

  describe('Asynchronous Effect', () => {
    it('should run async', async () => {
      const effect = promise(() => Promise.resolve('async result'))
      const result = await runAsync(effect)
      expect(result).toEqual({ _tag: 'Right', right: 'async result' })
    })
  })
}
