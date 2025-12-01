import * as E from 'src/Either'
import * as O from 'src/RuntimeOp'

import { fail, succeed, type Effect } from '..'
import { effectable } from '../internal/effectable'

/**
 * Swaps the success and failure channels of an Effect.
 *
 * Transforms an `Effect<A, E, R>` into an `Effect<E, A, R>` where:
 * - Successes become failures
 * - Failures become successes
 *
 * This is useful when you want to invert the meaning of success and failure,
 * or when composing effects that need opposite error handling semantics.
 *
 * @typeParam A - Type of the original success value (becomes the failure type)
 * @typeParam E - Type of the original failure value (becomes the success type)
 * @typeParam R - Type of the context/requirements (unchanged)
 * @param self - The Effect to flip
 * @returns An Effect with swapped success and failure channels
 *
 * @example
 * ```typescript
 * import { flip, fail, succeed, runPromise } from '@funkp/core/Effect'
 *
 * // Flipping a failure turns it into a success
 * const failedEffect = fail("oops")
 * const flippedFailure = flip(failedEffect)
 * await runPromise(flippedFailure) // resolves with "oops"
 *
 * // Flipping a success turns it into a failure
 * const successEffect = succeed(42)
 * const flippedSuccess = flip(successEffect)
 * await runPromise(flippedSuccess) // rejects with 42
 * ```
 */
export function flip<A, E, R>(self: Effect<A, E, R>): Effect<E, A, R> {
  return effectable([
    ...self.ops,
    O.iterate(function* (prevValue?: E.Either<E, A>) {
      if (prevValue && E.isRight(prevValue)) {
        // Previous was success, so we fail with that value
        return yield* fail(prevValue.right)
      } else if (prevValue) {
        // Previous was failure, so we succeed with that value
        return yield* succeed(prevValue.left)
      }
      throw new Error('flip: No previous value provided')
    }),
  ])
}

if (import.meta.vitest) {
  const { describe, it, expect, expectTypeOf } = import.meta.vitest

  describe('Effect.flip', async () => {
    const Effect = await import('src/Effect')

    it('should turn failures into successes', async () => {
      const effect = Effect.fail('oops' as const)
      const flipped = flip(effect)
      expectTypeOf(flipped).toEqualTypeOf<Effect<'oops', never, never>>()
      await expect(Effect.runPromise(flipped)).resolves.toEqual('oops')
    })

    it('should turn successes into failures', async () => {
      const effect = Effect.succeed(42)
      const flipped = flip(effect)
      expectTypeOf(flipped).toEqualTypeOf<Effect<never, number, never>>()
      await expect(Effect.runPromise(flipped)).rejects.toEqual(42)
    })

    it('should preserve context type', async () => {
      type MyContext = { config: string }
      const effect: Effect<number, never, MyContext> = Effect.succeed(100)
      const flipped = flip(effect)
      expectTypeOf(flipped).toEqualTypeOf<Effect<never, number, MyContext>>()
    })

    it('should work with pipe', async () => {
      const pipe = (await import('../../functions/pipe')).pipe
      const effect = pipe(
        Effect.fail('error'),
        flip,
        Effect.map((v) => v.toUpperCase()),
      )
      expectTypeOf(effect).toEqualTypeOf<Effect<string, never, never>>()
      await expect(Effect.runPromise(effect)).resolves.toEqual('ERROR')
    })

    it('should work with double flip (identity)', async () => {
      const effect = Effect.succeed('hello')
      const doubleFlipped = flip(flip(effect))
      expectTypeOf(doubleFlipped).toEqualTypeOf<Effect<string, never, never>>()
      await expect(Effect.runPromise(doubleFlipped)).resolves.toEqual('hello')
    })
  })
}
