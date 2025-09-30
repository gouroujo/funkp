import { Either, Left, right } from '..'
import { left } from '../constructors/left'
import { isLeft } from '../isLeft'

/**
 * Maps a function over the `Left` value of an `Either`.
 *
 * If the `Either` is `Left`, applies the provided function to the left value and returns a new `Left`.
 * If the `Either` is `Right`, returns the original `Right` unchanged.
 *
 * @typeParam In - Type of the input Left value
 * @typeParam Out - Type of the mapped Left value
 * @returns A function that takes an `Either` and returns a mapped `Either`
 *
 * @example
 * ```typescript
 * import { mapLeft, left, right, Either } from './mapLeft'
 *
 * const toLength = (s: string) => s.length
 * const mapL = mapLeft(toLength)
 *
 * const l: Either<string, number> = left('fail')
 * const r: Either<string, number> = right(10)
 *
 * const mappedL = mapL(l)
 * // mappedL is { _tag: 'Left', left: 4 }
 *
 * const mappedR = mapL(r)
 * // mappedR is { _tag: 'Right', right: 10 }
 * ```
 */
export function mapLeft<In, Out>(
  mapFn: (l: In) => Out,
): <L extends In, R>(
  either: Either<L, R>,
) => Either<L extends never ? never : Out, R> {
  return (either) => {
    if (isLeft(either)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return left(mapFn(either.left)) as Left<any>
    }
    return either
  }
}

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest

  it('should map Left value', () => {
    const l = left('error')
    const mapL = mapLeft((l: string) => l.length)
    const result = mapL(l)
    expect(result).toEqual({ _tag: 'Left', left: 5 })
  })

  it('should return Right unchanged', () => {
    const r = right(42)
    const mapL = mapLeft((l: string) => l.toUpperCase())
    const result = mapL(r)
    expect(result).toEqual(r)
  })
}
