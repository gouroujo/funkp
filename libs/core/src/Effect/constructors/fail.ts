import type { Effect } from '..'
import { Channel, put } from '../../Channel'
import * as E from '../../Either'

export const fail = <Failure>(
  failure: Failure,
): Effect<never, Failure, never> => {
  return function* (channel: Channel<E.Either<Failure, never>>) {
    yield put(channel, E.left(failure))
  }
}

if (import.meta.vitest) {
  const { describe, it, expect, expectTypeOf } = import.meta.vitest

  describe('Effect.fail', async () => {
    const runPromise = (await import('../run')).runPromise
    it('should fail with the provided number', async () => {
      const effect = fail(123)
      expectTypeOf(effect).toEqualTypeOf<Effect<never, number, never>>()
      const result = await runPromise(effect)
      expect(result).toBeLeftWith(123)
    })
    it('should fail with the provided string', async () => {
      const effect = fail('foo' as const)
      expectTypeOf(effect).toEqualTypeOf<Effect<never, 'foo', never>>()
      const result = await runPromise(effect)
      expect(result).toBeLeftWith('foo')
    })
    it('should fail with the provided number', async () => {
      const effect = fail(true)
      expectTypeOf(effect).toEqualTypeOf<Effect<never, boolean, never>>()
      const result = await runPromise(effect)
      expect(result).toBeLeftWith(true)
    })
  })
}
