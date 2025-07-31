export * from './bimap'
export * from './isLeft'
export * from './isRight'
export * from './left'
export * from './mapRight'
export * from './right'

export interface Left<L> {
  readonly _tag: 'Left'
  readonly left: L
}
export interface Right<R> {
  readonly _tag: 'Right'
  readonly right: R
}

export type Either<L, R> = Left<L> | Right<R>

export type RightType<E extends Either<unknown, unknown>> =
  E extends Right<infer R> ? R : never

export type LeftType<E extends Either<unknown, unknown>> =
  E extends Left<infer L> ? L : never
