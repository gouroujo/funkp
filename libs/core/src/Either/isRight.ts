import { Either, Right } from '.'

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
