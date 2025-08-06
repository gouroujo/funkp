/* eslint-disable require-yield */

import { A } from 'vitest/dist/chunks/environment.d.cL3nLXbE.js'
import { Either, isLeft, left, Left, LeftType, right } from '../Either'

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface Effect<Success, Error = never, Requirements = never> {
  // effect: () => Generator<Success>
  _tag: 'effect'
  [Symbol.asyncIterator]: () => AsyncGenerator<
    Left<Error> | Requirements,
    Success,
    any
  >
}
export interface SyncEffect<Success, Error = never, Requirements = never>
  extends Effect<Success, Error, Requirements> {
  [Symbol.iterator]: () => Generator<Left<Error> | Requirements, Success, any>
}

type GeneratorYield<T extends Generator> =
  T extends Generator<infer Y, any, any> ? Y : never
type FilterEffect<T> = T extends Effect<any, any, any> ? T : never
type FilterLeft<T> = T extends Left<any> ? T : never
type FilterRequirement<T> = T extends Requirement ? T : never

export type Success<T extends Effect<any, any, any>> =
  T extends Effect<infer S, any, any> ? S : never
type Error<T extends Effect<any, any, any>> =
  T extends Effect<any, infer E, any> ? E : never
type Context<T extends Effect<any, any, any>> =
  T extends Effect<any, any, infer C> ? C : never

type Requirement<Shape = any> = {
  _tag: 'requirement'
  // id: string
}
const s = Symbol.for('requirement')

const test =
  (id: string) =>
  <Self, Shape>() => {
    return class {
      _tag = 'requirement' as const
      static id = id
      static *[Symbol.iterator](): Generator<Self, Shape, Shape> {
        const value = yield { _tag: 'requirement', id } as Self
        return value
      }
    }
  }

class Random extends test('MyRandomService')<
  Random,
  { readonly next: SyncEffect<number> }
>() {}

type RequirementService<T> = T extends Requirement<infer S> ? S : never
const isRequirement = (value: any): value is Requirement =>
  value && value._tag === 'requirement'

// const makeRequirement = <Service>(name: string): Requirement<Service> => ({
//   _tag: 'requirement',
//   [Symbol.iterator]: function* () {
//     const service = yield name
//     return service
//   },
// })

export const isSync = <S, E, R>(
  effect: Effect<S, E, R>,
): effect is SyncEffect<S, E, R> => '[Symbol.iterator]' in effect

function gen<Success, Y extends Left<any> | Requirement = never, R = any>(
  genFn: () => Generator<Y, Success, R>,
): SyncEffect<Success, LeftType<FilterLeft<Y>>, FilterRequirement<Y>> {
  return {
    _tag: 'effect',
    [Symbol.iterator]: genFn,
    [Symbol.asyncIterator]: async function* () {
      const iterator = genFn()
      let result = iterator.next()
      while (!result.done) {
        // if (isLeft(result.value)) {
        //   yield result.value as FilterLeft<Y>
        // } else if (isRequirement(result.value)) {
        //   yield result.value as FilterRequirement<Y>
        // }
        yield result.value as FilterLeft<Y> | FilterRequirement<Y>
        // yield result.value as Left<Error>
        result = iterator.next()
      }
      return result.value
    },
  }
}
function asyncgen<Success, Failure, Requirements extends Requirement>(
  genFn: () => AsyncGenerator<
    Left<Failure> | Requirements,
    Awaited<Success>,
    never
  >,
): Effect<Success, Failure, Requirements> {
  return {
    _tag: 'effect',
    [Symbol.asyncIterator]: genFn,
  }
}

function fail<E>(error: E): SyncEffect<never, E, never> {
  return gen<never, Left<E>, never>(function* () {
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
    return result
  })
}

function tryPromise<Success, Failure>(
  promiseFn: () => Promise<Success>,
  catchFn: (error: unknown) => Failure,
): Effect<Success, Failure, never> {
  return asyncgen(async function* () {
    try {
      const result = await promiseFn()
      return result
    } catch (error) {
      return yield left(catchFn(error))
    }
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
    result = iterator.next()
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
      result = await iterator.next()
    }
    return right(result.value)
  })()
}

export function provide<Impl, R extends Requirement<Impl>>(
  requirement: R,
  implementation: Impl,
): <S, E, A>(effect: SyncEffect<S, E, A>) => SyncEffect<S, E, Exclude<A, R>> {
  return (effect) => {
    return gen(function* () {
      const iterator = effect[Symbol.iterator]()
      let result = iterator.next()
      while (!result.done) {
        if (isRequirement(result.value) && result.value.id === requirement.id) {
          result = iterator.next(implementation)
        } else {
          yield result.value as Left<any> | A
          result = iterator.next()
        }
      }
      return result.value
    })
  }
}

if (import.meta.vitest) {
  const { describe, it, expect, expectTypeOf } = import.meta.vitest

  describe('Synchronous Effect', () => {
    it('should combine effect', () => {
      const effect1 = succeed('effect1' as const)
      const effect2 = succeed('effect2' as const)
      const combined = gen(function* () {
        const a = yield* effect1
        const b = yield* effect2
        return `Combined: ${a}, ${b}` as const
      })
      expectTypeOf(combined).toEqualTypeOf<
        SyncEffect<'Combined: effect1, effect2', never, never>
      >()
      const result = runSync(combined)
      expect(result).toEqual({
        _tag: 'Right',
        right: 'Combined: effect1, effect2',
      })
    })
    it('should combine effect that fail', () => {
      const effect1 = fail('failure' as const)
      const effect2 = succeed('effect2' as const)
      const combined = gen(function* () {
        const a = yield* effect1
        const b = yield* effect2
        return `Combined: ${a}, ${b}` as const
      })
      expectTypeOf(combined).toEqualTypeOf<
        SyncEffect<never, 'failure', never>
      >()
      const result = runSync(combined)
      expect(result).toEqual({
        _tag: 'Left',
        left: 'failure',
      })
    })
    it('should combine effect that could fail', () => {
      const effect1 = gen(function* () {
        yield left('failure' as const)
        return 'effect1' as const
      })
      const effect2 = succeed('effect2' as const)
      const combined = gen(function* () {
        const a = yield* effect1
        const b = yield* effect2
        return `Combined: ${a}, ${b}` as const
      })
      expectTypeOf(combined).toEqualTypeOf<
        SyncEffect<'Combined: effect1, effect2', 'failure', never>
      >()
      const result = runSync(combined)
      expect(result).toEqual({
        _tag: 'Left',
        left: 'failure',
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
    it('should use requirements', () => {
      const effect = gen(function* () {
        const req = yield* Random
        const value = yield* req.next
        return `Requirement: ${value}`
      })
      const provided = provide(Random, { next: succeed(3) })(effect)
      const result = runSync(provided)
      expect(result).toEqual({
        _tag: 'Right',
        right: 'Requirement: 3',
      })
    })
  })

  describe('Asynchronous Effect', () => {
    it('should run async', async () => {
      const effect = promise(() => Promise.resolve('async result'))
      const result = await runAsync(effect)
      expect(result).toEqual({ _tag: 'Right', right: 'async result' })
    })
    it('should handle async failure', async () => {
      const effect = tryPromise(
        () => Promise.reject('async error'),
        (error) => 'error: ' + error,
      )
      const result = await runAsync(effect)
      expect(result).toEqual({ _tag: 'Left', left: 'error: async error' })
    })
    it('combine with sync effect', async () => {
      const syncEffect = succeed('effect1')
      const asyncEffect = promise(() => Promise.resolve('async part'))
      const effect = asyncgen(async function* () {
        const syncResult = yield* syncEffect
        const asyncResult = yield* asyncEffect
        return `Combined: ${syncResult}, ${asyncResult}` as const
      })
      const result = await runAsync(effect)
      expect(result).toEqual({
        _tag: 'Right',
        right: 'Combined: effect1, async part',
      })
    })
  })
}
