import { Effect, runPromise } from '..'

export function succeed<Success>(
  value: Success,
): Effect<Success, never, never> {
  return {
    _tag: 'Pure',
    value,
    *[Symbol.iterator]() {
      return yield this
    },
  }
}

export function of<Success>(value: Success): Effect<Success, never, never> {
  return succeed(value)
}

if (import.meta.vitest) {
  const { it, expect, expectTypeOf } = import.meta.vitest

  it('should succeed with the provided number', async () => {
    const effect = succeed(123)
    expectTypeOf(effect).toEqualTypeOf<Effect<number, never, never>>()
    const result = await runPromise(effect)
    expect(result).toEqual(123)
  })
  it('should succeed with the provided string', async () => {
    const effect = succeed('foo' as const)
    expectTypeOf(effect).toEqualTypeOf<Effect<'foo', never, never>>()
    const result = await runPromise(effect)
    expect(result).toEqual('foo')
  })
  it('should succeed with the provided number', async () => {
    const effect = succeed(true)
    expectTypeOf(effect).toEqualTypeOf<Effect<boolean, never, never>>()
    const result = await runPromise(effect)
    expect(result).toEqual(true)
  })
}
