import { Either, isRight } from '..'

export function flatten<L1, L2, R2>(): (
  either: Either<L1, Either<L2, R2>>,
) => Either<L1 | L2, R2> {
  return (either) => (isRight(either) ? either.right : either)
}
