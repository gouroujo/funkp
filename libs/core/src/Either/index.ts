export * from './isLeft'
export * from './isRight'
export * from './mapRight'

export interface Left<L> {
  readonly _tag: 'Left'
  readonly left: L
}
export interface Right<R> {
  readonly _tag: 'Right'
  readonly right: R
}

export type Either<L, R> = Left<L> | Right<R>
