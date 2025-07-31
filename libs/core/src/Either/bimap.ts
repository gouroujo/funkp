import { Either, isLeft, left, right } from '.'

export const bimap = <L, R, L2, R2>(
  either: Either<L, R>,
  f: (l: L) => L2,
  g: (r: R) => R2,
): Either<L2, R2> => {
  if (isLeft(either)) {
    return left(f(either.left))
  }
  return right(g(either.right))
}

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest

  it('should map Left value', () => {
    const left: Either<string, number> = { _tag: 'Left', left: 'error' }
    const result = bimap(
      left,
      (l) => l.toUpperCase(),
      (r: string) => r,
    )
    expect(result).toEqual({ _tag: 'Left', left: 'ERROR' })
  })

  it('should map Right value', () => {
    const right: Either<string, number> = { _tag: 'Right', right: 42 }
    const result = bimap(
      right,
      (l: string) => l.toUpperCase(),
      (r) => r * 2,
    )
    expect(result).toEqual({ _tag: 'Right', right: 84 })
  })
}
