import { Left, left } from 'src/Either'
import { Effect, promise, runPromise } from '..'

export function gen<Success, Failure, Requirements>(
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
  })

  describe('Synchronous Effect', () => {
    it('should combine effect', () => {
      const combined = gen(function* () {
        const a = yield* effect1
        const b = yield* effect2
        return `Combined: ${a}, ${b}` as const
      })
      expectTypeOf(combined).toEqualTypeOf<
        Effect<'Combined: effect1, effect2', never, never>
      >()
      const result = runPromise(combined)
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
      expectTypeOf(combined).toEqualTypeOf<Effect<never, 'fail', never>>()
      expect(spy).not.toHaveBeenCalled()
      const result = runPromise(combined)
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
        Effect<'Combined: effect1, effect2', 'failure', never>
      >()
      const result = runPromise(combined)
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
      const result = await runPromise(effect)
      expect(result).toEqual({
        _tag: 'Right',
        right: 'Combined: effect1, async part',
      })
    })
  })
}
