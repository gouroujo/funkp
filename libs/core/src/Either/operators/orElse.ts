import { Either, isLeft } from '..'

/**
 * Returns a function that takes an `Either` and, if it is a `Left`, applies the provided `onLeft` function to transform it.
 * If the `Either` is a `Right`, it is returned as is.
 *
 * @typeParam E1 - The error type of the input `Either`.
 * @typeParam A - The success type of the result `Either`.
 * @typeParam E2 - The error type of the resulting `Either` after applying `onLeft`.
 * @param onLeft - A function that takes an error of type `E1` and returns an `Either` of type `E2` or `A`.
 * @returns A function that takes an `Either<E1, B>` and returns an `Either<E2, A | B>`.
 */
export function orElse<E1, A, E2>(
  onLeft: (e: E1) => Either<E2, A>,
): <B>(ma: Either<E1, B>) => Either<E2, A | B> {
  return (ma) => (isLeft(ma) ? onLeft(ma.left) : ma)
}

if (import.meta.vitest) {
  const { it, expect, describe } = import.meta.vitest
  describe('Either.orElse', async () => {
    const { left, right } = await import('../constructors')
    it('should returns the original Right', () => {
      const fallback = () => left('fallback')
      const f = orElse(fallback)
      const result = f(right(42))
      expect(result).toEqual({ _tag: 'Right', right: 42 })
    })

    it('should calls onLeft for Left', () => {
      const e = left('err')
      const fallback = (msg: string) => right(msg.length)
      expect(orElse(fallback)(e)).toEqual(right(3))
    })

    it('should preserves Left if fallback returns Left', () => {
      const e = left('fail')
      const fallback = (msg: string) => left(msg.toUpperCase())
      expect(orElse(fallback)(e)).toEqual(left('FAIL'))
    })
  })
}
