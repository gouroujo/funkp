import { Either } from '.'

export const right = <R>(right: R): Either<never, R> => ({
  _tag: 'Right',
  right,
})

export const of = right
