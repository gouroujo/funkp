import { Either, Right } from '.'

/**
 * Type guard to check if an `Either` value is a `Right`.
 *
 * Returns `true` if the given `Either` is a `Right`, otherwise returns `false`.
 *
 * @typeParam L - Type of the Left value
 * @typeParam R - Type of the Right value
 * @param either - The `Either` value to check
 * @returns `true` if `either` is a `Right`, otherwise `false`
 *
 * @example
 * ```typescript
 * import { isRight } from './isRight'
 * import { left, right, Either } from '.'
 *
 * const l: Either<string, number> = left('fail')
 * const r: Either<string, number> = right(42)
 *
 * console.log(isRight(l)) // false
 * console.log(isRight(r)) // true
 * ```
 */
export const isRight = <L, R>(either: Either<L, R>): either is Right<R> => {
  return either._tag === 'Right'
}

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest

  it('should return true for Right', () => {
    const right: Either<string, number> = { _tag: 'Right', right: 42 }
    expect(isRight(right)).toBe(true)
  })

  it('should return false for Left', () => {
    const left: Either<string, number> = { _tag: 'Left', left: 'error' }
    expect(isRight(left)).toBe(false)
  })
}
