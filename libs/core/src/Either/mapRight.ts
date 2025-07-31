import { Either, left } from '.'
import { isRight } from './isRight'
import { right } from './right'

/**
 * Maps a function over the Right value of an Either.
 *
 * @param either - The Either to map over.
 * @param f - The function to apply to the Right value.
 * @returns A new Either with the mapped Right value, or the original Left value if it exists.
 */
export const mapRight = <L = never, R = never, R2 = never>(
  either: Either<L, R>,
  f: (r: R) => R2,
): Either<L, R2> => {
  if (isRight(either)) {
    return right(f(either.right))
  }
  return either
}
/**
 * Alias for `mapRight` for consistency with other functional libraries.
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
