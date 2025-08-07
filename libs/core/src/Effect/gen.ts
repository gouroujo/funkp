import { Effect, SyncEffect } from '.'
import { left, Left, LeftType } from '../Either'
import { promise } from './promise'
import { run } from './run'
import { Requirement } from './service'

type FilterLeft<T> = T extends Left<unknown> ? T : never
type FilterRequirement<T> = T extends Requirement ? T : never

export function gen<
  Success,
  Y extends Left<any> | Requirement = never,
  R = any,
>(
  genFn: () => Generator<Y, Success, R>,
): SyncEffect<Success, LeftType<FilterLeft<Y>>, FilterRequirement<Y>> {
  return {
    _tag: 'effect',
    [Symbol.iterator]: genFn,
    [Symbol.asyncIterator]: async function* () {
      const iterator = genFn()
      let result = iterator.next()
      while (!result.done) {
        yield result.value as FilterLeft<Y> | FilterRequirement<Y>
        result = iterator.next()
      }
      return result.value
    },
  }
}

export function asyncgen<Success, Failure, Requirements extends Requirement>(
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

if (import.meta.vitest) {
  const { describe, it, expect, expectTypeOf } = import.meta.vitest

  // eslint-disable-next-line require-yield
  const effect1 = gen(function* () {
    return 'effect1' as const
  })
  // eslint-disable-next-line require-yield
  const effect2 = gen(function* () {
    return 'effect2' as const
  })
  const failure = gen<never, Left<'fail'>, never>(function* () {
    return yield left('fail' as const)
  })

  describe('Synchronous Effect', () => {
    it('should combine effect', () => {
      const combined = gen(function* () {
        const a = yield* effect1
        const b = yield* effect2
        return `Combined: ${a}, ${b}` as const
      })
      expectTypeOf(combined).toEqualTypeOf<
        SyncEffect<'Combined: effect1, effect2', never, never>
      >()
      const result = run(combined)
      expect(result).toEqual({
        _tag: 'Right',
        right: 'Combined: effect1, effect2',
      })
    })
    it('should combine effect that fail', () => {
      const combined = gen(function* () {
        const a = yield* failure
        const b = yield* effect2
        return `Combined: ${a}, ${b}` as const
      })
      expectTypeOf(combined).toEqualTypeOf<SyncEffect<never, 'fail', never>>()
      const result = run(combined)
      expect(result).toEqual({
        _tag: 'Left',
        left: 'fail',
      })
    })
    it('should combine effect that could fail', () => {
      const potentialFailure = gen(function* () {
        yield left('failure' as const)
        return 'effect1' as const
      })
      const combined = gen(function* () {
        const a = yield* potentialFailure
        const b = yield* effect2
        return `Combined: ${a}, ${b}` as const
      })
      expectTypeOf(combined).toEqualTypeOf<
        SyncEffect<'Combined: effect1, effect2', 'failure', never>
      >()
      const result = run(combined)
      expect(result).toEqual({
        _tag: 'Left',
        left: 'failure',
      })
    })
  })

  describe('Asynchronous Effect', () => {
    it('combine with sync effect', async () => {
      const asyncEffect = promise(() => Promise.resolve('async part' as const))
      const effect = asyncgen(async function* () {
        const syncResult = yield* effect1
        const asyncResult = yield* asyncEffect
        return `Combined: ${syncResult}, ${asyncResult}` as const
      })
      const result = await run(effect)
      expect(result).toEqual({
        _tag: 'Right',
        right: 'Combined: effect1, async part',
      })
    })
  })
}
