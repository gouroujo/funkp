import { SyncEffect } from '.'
import { gen } from './gen'
import { run } from './run'

export function succeed<T>(value: T): SyncEffect<T, never, never> {
  // eslint-disable-next-line require-yield
  return gen(function* () {
    return value
  })
}

if (import.meta.vitest) {
  const { it, expect, expectTypeOf } = import.meta.vitest

  it('should succeed with the provided number', () => {
    const effect = succeed(123)
    expectTypeOf(effect).toEqualTypeOf<SyncEffect<number, never, never>>()
    expect(run(effect)).toEqual({ _tag: 'Right', right: 123 })
  })
  it('should succeed with the provided string', () => {
    const effect = succeed('foo' as const)
    expectTypeOf(effect).toEqualTypeOf<SyncEffect<'foo', never, never>>()
    expect(run(effect)).toEqual({ _tag: 'Right', right: 'foo' })
  })
  it('should succeed with the provided number', () => {
    const effect = succeed(true)
    expectTypeOf(effect).toEqualTypeOf<SyncEffect<boolean, never, never>>()
    expect(run(effect)).toEqual({ _tag: 'Right', right: true })
  })
}
