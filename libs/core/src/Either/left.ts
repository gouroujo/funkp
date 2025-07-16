import { Either } from '.'

export const left = <L>(left: L): Either<L, never> => ({
  _tag: 'Left',
  left,
})
