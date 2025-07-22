import { Either, Left } from '.'

export const isLeft = <L, R>(either: Either<L, R>): either is Left<L> => {
  return either._tag === 'Left'
}

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest

  it('should return true for Left', () => {
    const left: Either<string, number> = { _tag: 'Left', left: 'error' }
    expect(isLeft(left)).toBe(true)
  })

  it('should return false for Right', () => {
    const right: Either<string, number> = { _tag: 'Right', right: 42 }
    expect(isLeft(right)).toBe(false)
  })
}
