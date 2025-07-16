import { Either } from '.'
import { isRight } from './isRight'

export const mapRight = <L, R, R2>(
  either: Either<L, R>,
  f: (r: R) => R2,
): Either<L, R2> => {
  if (isRight(either)) {
    return {
      _tag: 'Right',
      right: f(either.right),
    }
  }
  return either
}
