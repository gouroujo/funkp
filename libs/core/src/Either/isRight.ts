import { isObjectWithKeyValue } from 'src/utils'
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
export function isRight<R>(either: unknown): either is Right<R>
export function isRight<L, R>(either: Either<L, R>): either is Right<R>
export function isRight<L, R>(
  either: Either<L, R> | unknown,
): either is Right<R> {
  return isObjectWithKeyValue(either, '_tag', 'Right')
}

if (import.meta.vitest) {
  const { describe, it, expect, expectTypeOf } = import.meta.vitest
  describe('Either.isRight', () => {
    it('should return true for Right', () => {
      const right: Either<string, number> = { _tag: 'Right', right: 42 }
      expect(isRight(right)).toBe(true)
      if (isRight(right)) expectTypeOf(right).toEqualTypeOf<Right<number>>()
    })
    it("should return true for unknow if it's a right", () => {
      const right: unknown = { _tag: 'Right', right: 'foo' }
      if (isRight(right)) expectTypeOf(right).toEqualTypeOf<Right<unknown>>()
    })

    it('should return false for Left', () => {
      const left: Either<string, number> = { _tag: 'Left', left: 'error' }
      expect(isRight(left)).toBe(false)
    })
    it.each([42, 'foo', null, undefined, true, false, {}, { _tag: 'a' }])(
      'should return false for non-Either  value: "%s"',
      (v) => {
        expect(isRight(v)).toBe(false)
      },
    )
  })
}
