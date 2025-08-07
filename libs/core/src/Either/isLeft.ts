import { Either, Left } from '.'

/**
 * Type guard to check if an `Either` value is a `Left`.
 *
 * Returns `true` if the given `Either` is a `Left`, otherwise returns `false`.
 *
 * @typeParam L - Type of the Left value
 * @typeParam R - Type of the Right value
 * @param either - The `Either` value to check
 * @returns `true` if `either` is a `Left`, otherwise `false`
 *
 * @example
 * ```typescript
 * import { isLeft, left, right, Either } from '@funkp/core/Either'
 *
 * const l: Either<string, number> = left('fail')
 * const r: Either<string, number> = right(42)
 *
 * console.log(isLeft(l)) // true
 * console.log(isLeft(r)) // false
 * ```
 */
export function isLeft<L>(either: unknown): either is Left<L>
export function isLeft<L, R>(either: Either<L, R>): either is Left<L>
export function isLeft<L, R>(
  either: Either<L, R> | unknown,
): either is Left<L> {
  return (
    typeof either === 'object' &&
    either !== null &&
    '_tag' in either &&
    either._tag === 'Left'
  )
}

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest
  it('should return false for non-Either values', () => {
    expect(isLeft(42)).toBe(false)
    expect(isLeft('string')).toBe(false)
    expect(isLeft({})).toBe(false)
    expect(isLeft(null)).toBe(false)
    expect(isLeft(undefined)).toBe(false)
  })
  it('should return true for Left', () => {
    const left: Either<string, number> = { _tag: 'Left', left: 'error' }
    expect(isLeft(left)).toBe(true)
  })

  it('should return false for Right', () => {
    const right: Either<string, number> = { _tag: 'Right', right: 42 }
    expect(isLeft(right)).toBe(false)
  })
}
