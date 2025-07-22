import { Either, isLeft } from '.'

export const bimap = <L, R, L2, R2>(
  either: Either<L, R>,
  f: (l: L) => L2,
  g: (r: R) => R2,
): Either<L2, R2> => {
  if (isLeft(either)) {
    return { _tag: 'Left', left: f(either.left) }
  }
  return { _tag: 'Right', right: g(either.right) }
}
