import { SyncEffect } from '.'
import { Left, left } from '../Either'
import { gen } from './gen'
import { run } from './run'

export function fail<E>(error: E): SyncEffect<never, E, never> {
  return gen(function* (): Generator<Left<E>> {
    yield left(error)
  }) as SyncEffect<never, E, never>
}
if (import.meta.vitest) {
  const { it, expect, expectTypeOf } = import.meta.vitest

  it('should fail with the provided number', () => {
    const effect = fail(123)
    expectTypeOf(effect).toEqualTypeOf<SyncEffect<never, number, never>>()
    expect(run(effect)).toEqual({ _tag: 'Left', left: 123 })
  })
  it('should fail with the provided string', () => {
    const effect = fail('foo' as const)
    expectTypeOf(effect).toEqualTypeOf<SyncEffect<never, 'foo', never>>()
    expect(run(effect)).toEqual({ _tag: 'Left', left: 'foo' })
  })
  it('should fail with the provided number', () => {
    const effect = fail(true)
    expectTypeOf(effect).toEqualTypeOf<SyncEffect<never, boolean, never>>()
    expect(run(effect)).toEqual({ _tag: 'Left', left: true })
  })
}
