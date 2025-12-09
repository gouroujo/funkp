import type { Either } from '..'
import { right } from '../constructors/right'
import { isRight } from '../isRight'

/**
 * Maps a function over the `Right` value of an `Either`.
 *
 * If the `Either` is `Right`, applies the provided function to the right value and
 * returns a new `Right` containing the mapped value. If the `Either` is `Left`,
 * the original `Left` is returned unchanged (with its type adapted to the new
 * `Either<L, R2>` shape via a type cast).
 *
 * @typeParam R1 - Type of the original Right value
 * @typeParam R2 - Type of the mapped Right value
 * @param mapFn - The function to apply to the `Right` value
 * @returns A function that takes an `Either` and returns a mapped `Either`
 *
 * @example
 * ```typescript
 * import { mapRight, right, left, Either } from './mapRight'
 *
 * const double = (n: number) => n * 2
 * const mapR = mapRight(double)
 *
 * const r: Either<string, number> = right(10)
 * const l: Either<string, number> = left('fail')
 *
 * const mappedR = mapR(r)
 * // mappedR is { _tag: 'Right', right: 20 }
 *
 * const mappedL = mapR(l)
 * // mappedL is { _tag: 'Left', left: 'fail' }
 * ```
 */
export const mapRight = <R1, R2>(mapFn: (r: R1) => R2) => {
  return <L = never>(either: Either<L, R1>): Either<L, R2> => {
    if (isRight(either)) {
      return right(mapFn(either.right))
    }
    return either
  }
}

/**
 * Alias for {@link mapRight}. Useful for compatibility with other functional libraries.
 */
export const map = mapRight

if (import.meta.vitest) {
  const { it, expect, expectTypeOf } = import.meta.vitest
  const Either = await import('src/Either')

  it('should map Right value', () => {
    const r = Either.right(42)
    const result = Either.mapRight((n: number) => n * 2)(r)
    expect(result).toEqualRight(84)
    expectTypeOf(result).toEqualTypeOf<Either<never, number>>()
  })

  it('should return Left unchanged and keep Left type when Right is never', () => {
    const left: Either<void, never> = Either.left()
    const result = Either.mapRight((x: never) => x)(left)
    expect(result).toBe(left)
    expectTypeOf(result).toEqualTypeOf<Either<void, never>>()
  })
}
