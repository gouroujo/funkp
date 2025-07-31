import { Either, isLeft, left, right } from '.'

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
 * @param either - The `Either` value to map over
 * @param mapLeft - Function to apply if `either` is `Left`
 * @param mapRight - Function to apply if `either` is `Right`
 * @returns A new `Either` with the mapped value
 *
 * @example
 * ```typescript
 * import { bimap, left, right, Either } from '@funkp/core/Either'
 *
 * const e1: Either<string, number> = left('fail')
 * const e2: Either<string, number> = right(10)
 *
 * const mapped1 = bimap(e1, s => s.toUpperCase(), n => n * 2)
 * // mapped1 is { _tag: 'Left', left: 'FAIL' }
 *
 * const mapped2 = bimap(e2, s => s.toUpperCase(), n => n * 2)
 * // mapped2 is { _tag: 'Right', right: 20 }
 * ```
 */
export const bimap = <L, R, L2, R2>(
  either: Either<L, R>,
  mapLeft: (l: L) => L2,
  mapRight: (r: R) => R2,
): Either<L2, R2> => {
  if (isLeft(either)) {
    return left(mapLeft(either.left))
  }
  return right(mapRight(either.right))
}

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest

  it('should map Left value', () => {
    const left: Either<string, number> = { _tag: 'Left', left: 'error' }
    const result = bimap(
      left,
      (l) => l.toUpperCase(),
      (r: string) => r,
    )
    expect(result).toEqual({ _tag: 'Left', left: 'ERROR' })
  })

  it('should map Right value', () => {
    const right: Either<string, number> = { _tag: 'Right', right: 42 }
    const result = bimap(
      right,
      (l: string) => l.toUpperCase(),
      (r) => r * 2,
    )
    expect(result).toEqual({ _tag: 'Right', right: 84 })
  })
}
