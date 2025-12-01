import { isRight, type Either } from '.'

export function isEither<L, R>(either: unknown): either is Either<L, R>
export function isEither<L, R>(either: Either<L, R>): either is Either<L, R>
export function isEither<L, R>(
  either: Either<L, R> | unknown,
): either is Either<L, R> {
  return (
    typeof either === 'object' &&
    either !== null &&
    '_tag' in either &&
    (either._tag === 'Left' || either._tag === 'Right')
  )
}

export function getEither<L, R>(either: Either<L, R>): L | R {
  return isRight(either) ? either.right : either.left
}

if (import.meta.vitest) {
  const { describe, it, expect } = import.meta.vitest
  describe('Either.isEither', () => {
    it('should return false for non-Either values', () => {
      expect(isEither(42)).toBe(false)
      expect(isEither('string')).toBe(false)
      expect(isEither({})).toBe(false)
      expect(isEither(null)).toBe(false)
      expect(isEither(undefined)).toBe(false)
    })
    it('should return true for Left', () => {
      const left: Either<string, number> = { _tag: 'Left', left: 'error' }
      expect(isEither(left)).toBe(true)
    })

    it('should return true for Right', () => {
      const right: Either<string, number> = { _tag: 'Right', right: 42 }
      expect(isEither(right)).toBe(true)
    })
  })
}
