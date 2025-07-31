import { Either, left } from '.'
import { isRight } from './isRight'
import { right } from './right'


/**
 * Maps a function over the `Right` value of an `Either`.
 *
 * If the `Either` is `Right`, applies the provided function to the right value and returns a new `Right`.
 * If the `Either` is `Left`, returns the original `Left` unchanged.
 *
 * @typeParam L - Type of the Left value
 * @typeParam R - Type of the original Right value
 * @typeParam R2 - Type of the mapped Right value
 * @param either - The `Either` to map over
 * @param mapFunction - The function to apply to the `Right` value
 * @returns A new `Either` with the mapped `Right` value, or the original `Left` value if it exists
 *
 * @example
 * ```typescript
 * import { mapRight, right, left, Either } from './mapRight'
 *
 * const r: Either<string, number> = right(10)
 * const l: Either<string, number> = left('fail')
 *
 * const mappedR = mapRight(r, n => n * 2)
 * // mappedR is { _tag: 'Right', right: 20 }
 *
 * const mappedL = mapRight(l, n => n * 2)
 * // mappedL is { _tag: 'Left', left: 'fail' }
 * ```
 */
export const mapRight = <L = never, R = never, R2 = never>(
  either: Either<L, R>,
  mapFunction: (r: R) => R2,
): Either<L, R2> => {
  if (isRight(either)) {
    return right(mapFunction(either.right))
  }
  return either
}

/**
 * Alias for {@link mapRight}. Useful for compatibility with other functional libraries.
 *
 * @typeParam L - Type of the Left value
 * @typeParam R - Type of the original Right value
 * @typeParam R2 - Type of the mapped Right value
 * @param either - The `Either` to map over
 * @param mapFunction - The function to apply to the `Right` value
 * @returns A new `Either` with the mapped `Right` value, or the original `Left` value if it exists
 *
 * @example
 * ```typescript
 * import { map, right, left, Either } from './mapRight'
 *
 * const r: Either<string, number> = right(5)
 * const mapped = map(r, n => n + 1)
 * // mapped is { _tag: 'Right', right: 6 }
 * ```
 */
export const map = mapRight

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest

  it('should map Right value', () => {
    const r = right(42)
    const result = mapRight(r, (r) => r * 2)
    expect(result).toEqual({ _tag: 'Right', right: 84 })
  })

  it('should return Left unchanged', () => {
    const l = left('error')
    const result = mapRight(l, (r) => r * 2)
    expect(result).toEqual(l)
  })
}
