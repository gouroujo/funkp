import type { Either } from '..'
import { isLeft } from '..'
import { left, right } from '../constructors'

/**
 * Applies two functions to an `Either` value, one for the `Left` case and one for the `Right` case.
 *
 * - If the `Either` is `Left`, applies the first function `mapLeft` to the left value.
 * - If the `Either` is `Right`, applies the second function `mapRight` to the right value.
 *
 * @typeParam L - Type of the original Left value
 * @typeParam R - Type of the original Right value
 * @typeParam L2 - Type of the mapped Left value
 * @typeParam R2 - Type of the mapped Right value
 * @param mapLeft - Function to apply if the Either is Left
 * @param mapRight - Function to apply if the Either is Right
 * @returns A function that takes an Either and returns a mapped Either
 *
 * @example
 * ```typescript
 * import { bimap, left, right, Either } from '@funkp/core/Either'
 *
 * const toUpper = (s: string) => s.toUpperCase()
 * const double = (n: number) => n * 2
 *
 * const mapBoth = bimap(toUpper, double)
 *
 * const e1: Either<string, number> = left('fail')
 * const e2: Either<string, number> = right(10)
 *
 * const mapped1 = mapBoth(e1)
 * // mapped1 is { _tag: 'Left', left: 'FAIL' }
 *
 * const mapped2 = mapBoth(e2)
 * // mapped2 is { _tag: 'Right', right: 20 }
 * ```
 */
export function bimap<L, R, L2, R2>(
  mapLeft: (l: L) => L2,
  mapRight: (r: R) => R2,
): (either: Either<L, R>) => Either<L2, R2> {
  return (either) => {
    if (isLeft(either)) {
      return left(mapLeft(either.left))
    }
    return right(mapRight(either.right))
  }
}

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest

  it('should map Left value', () => {
    const l: Either<string, number> = { _tag: 'Left', left: 'error' }
    const mapBoth = bimap(
      (l: string) => l.toUpperCase(),
      (r: number) => r,
    )
    const result = mapBoth(l)
    expect(result).toEqual({ _tag: 'Left', left: 'ERROR' })
  })

  it('should map Right value', () => {
    const r: Either<string, number> = { _tag: 'Right', right: 42 }
    const mapBoth = bimap(
      (l: string) => l.toUpperCase(),
      (r: number) => r * 2,
    )
    const result = mapBoth(r)
    expect(result).toEqual({ _tag: 'Right', right: 84 })
  })
}
