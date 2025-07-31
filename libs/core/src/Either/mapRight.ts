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
export function mapRight<L = never, R = never, R2 = never>(
  mapFn: (r: R) => R2,
): (either: Either<L, R>) => Either<L, R2> {
  return (either) => {
    if (isRight(either)) {
      return right(mapFn(either.right))
    }
    return either
  }
}

/**
 * Alias for {@link mapRight}. Useful for compatibility with other functional libraries.
 *
 * @typeParam L - Type of the Left value
 * @typeParam R - Type of the original Right value
 * @typeParam R2 - Type of the mapped Right value
 * @param mapFn - The function to apply to the `Right` value
 * @returns A function that takes an `Either` and returns a mapped `Either`
 *
 * @example
 * ```typescript
 * import { map, right, left, Either } from './mapRight'
 *
 * const inc = (n: number) => n + 1
 * const mapInc = map(inc)
 *
 * const r: Either<string, number> = right(5)
 * const mapped = mapInc(r)
 * // mapped is { _tag: 'Right', right: 6 }
 * ```
 */
export const map = mapRight

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest

  it('should map Right value', () => {
    const r: Either<never, number> = right(42)
    const mapR = mapRight((r: number) => r * 2)
    const result = mapR(r)
    expect(result).toEqual({ _tag: 'Right', right: 84 })
  })

  it('should return Left unchanged', () => {
    const l: Either<never, never> = left(undefined as never)
    const mapR = mapRight((r: never) => r)
    const result = mapR(l)
    expect(result).toEqual(l)
  })
}
