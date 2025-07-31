import { Predicate } from 'src/utils/function/types'
import { Either, isRight, left, right } from '.'

/**
 * Returns a function that filters an `Either` value using the provided predicate.
 *
 * If the `Either` is a `Right` and the predicate returns `true` for its value, the original `Right` is returned.
 * If the predicate returns `false`, a `Left` is returned with the error produced by the `onFalse` function.
 * If the `Either` is already a `Left`, it is returned unchanged.
 *
 * @typeParam A - The type of the value contained in `Right`.
 * @typeParam E2 - The type of the error produced by `onFalse`.
 * @param predicate - A function that takes a value of type `A` and returns a boolean.
 * @param onFalse - A function that takes a value of type `A` and returns an error of type `E2` if the predicate fails.
 * @returns A function that takes an `Either<E1, B>` and returns an `Either<E1 | E2, B>`.
 */
export function filterOrElse<A, E2>(
  predicate: Predicate<A>,
  onFalse: (a: A) => E2,
): <E1, B extends A>(ma: Either<E1, B>) => Either<E1 | E2, B> {
  return (ma) => {
    if (isRight(ma)) {
      return predicate(ma.right) ? ma : left(onFalse(ma.right))
    }
    return ma
  }
}

// Tests
if (import.meta.vitest) {
  const { describe, it, expect } = import.meta.vitest

  describe('filterOrElse', () => {
    const isPositive = (n: number) => n > 0
    const notPositive = (n: number) => `not positive: ${n}`

    it('returns Right if predicate is true', () => {
      const f = filterOrElse(isPositive, notPositive)
      const result = f(right(5))
      expect(result).toEqual(right(5))
    })

    it('returns Left if predicate is false', () => {
      expect(filterOrElse(isPositive, notPositive)(right(-2))).toEqual(
        left('not positive: -2'),
      )
    })

    it('returns original Left unchanged', () => {
      expect(filterOrElse(isPositive, notPositive)(left('fail'))).toEqual(
        left('fail'),
      )
    })
  })
}
