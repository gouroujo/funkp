import { Effect, SyncEffect } from '.'
import { left, Left, LeftType } from '../Either'
import { isIterable } from '../utils/iterable/isIterable'
import { promise } from './promise'
import { run } from './run'
import { Requirement } from './service'

type FilterLeft<T> = T extends Left<unknown> ? T : never
type FilterRequirement<T> = T extends Requirement ? T : never

export function gen<Success, YieldedValues extends Left | Requirement = never>(
  genFn: () => Generator<YieldedValues, Success>,
): SyncEffect<
  Success,
  LeftType<FilterLeft<YieldedValues>>,
  FilterRequirement<YieldedValues>
>
export function gen<Success, YieldedValues extends Left | Requirement = never>(
  asyncgenFn: () => AsyncGenerator<YieldedValues, Success>,
): Effect<
  Success,
  LeftType<FilterLeft<YieldedValues>>,
  FilterRequirement<YieldedValues>
>
export function gen<Success, YieldedValues extends Left | Requirement = never>(
  genFn: () =>
    | Generator<YieldedValues, Success>
    | AsyncGenerator<YieldedValues, Success>,
):
  | Effect<
      Success,
      LeftType<FilterLeft<YieldedValues>>,
      FilterRequirement<YieldedValues>
    >
  | SyncEffect<
      Success,
      LeftType<FilterLeft<YieldedValues>>,
      FilterRequirement<YieldedValues>
    > {
  const iterator = genFn()
  if (isIterable(iterator)) {
    return {
      _tag: 'effect',
      [Symbol.iterator]: genFn as () => Generator<
        FilterLeft<YieldedValues> | FilterRequirement<YieldedValues>,
        Success
      >,
      [Symbol.asyncIterator]: async function* () {
        let result = iterator.next()
        while (!result.done) {
          yield result.value as
            | FilterLeft<YieldedValues>
            | FilterRequirement<YieldedValues>
          result = iterator.next()
        }
        return result.value
      },
    }
  } else {
    return {
      _tag: 'effect',
      [Symbol.asyncIterator]: genFn as () => AsyncGenerator<
        FilterLeft<YieldedValues> | FilterRequirement<YieldedValues>,
        Success
      >,
    }
  }
}

if (import.meta.vitest) {
  const { describe, it, expect, expectTypeOf, vi } = import.meta.vitest

  // eslint-disable-next-line require-yield
  const effect1 = gen(function* () {
    return 'effect1' as const
  })
  // eslint-disable-next-line require-yield
  const effect2 = gen(function* () {
    return 'effect2' as const
  })
  const failure = gen(function* (): Generator<Left<'fail'>> {
    yield left('fail' as const)
  }) as SyncEffect<never, 'fail', never>

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
      const spy = vi.fn()
      const combined = gen(function* () {
        const a = yield* failure
        spy()
        const b = yield* effect2
        return `Combined: ${a}, ${b}` as const
      })
      expectTypeOf(combined).toEqualTypeOf<SyncEffect<never, 'fail', never>>()
      expect(spy).not.toHaveBeenCalled()
      const result = run(combined)
      expect(spy).not.toHaveBeenCalled()
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
      const effect = gen(async function* () {
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
