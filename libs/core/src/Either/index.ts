export * from './bimap'
export * from './filterOrElse'
export * from './isLeft'
export * from './isRight'
export * from './left'
export * from './mapLeft'
export * from './mapRight'
export * from './orElse'
export * from './right'
export * from './tryCatch'

/**
 * Represents the Left variant of an {@link Either}.
 *
 * Typically used to represent failure or an error.
 *
 * @typeParam L - Type of the Left value
 * @example
 * ```typescript
 * import { Left } from '@funkp/core/Either'
 *
 * const l: Left<string> = { _tag: 'Left', left: 'fail' }
 * // l._tag === 'Left'
 * // l.left === 'fail'
 * ```
 */
export interface Left<L = any> {
  readonly _tag: 'Left'
  readonly left: L
}

/**
 * Represents the Right variant of an {@link Either}.
 *
 * Typically used to represent success or a valid result.
 *
 * @typeParam R - Type of the Right value
 * @example
 * ```typescript
 * import { Right } from '@funkp/core/Either'
 *
 * const r: Right<number> = { _tag: 'Right', right: 42 }
 * // r._tag === 'Right'
 * // r.right === 42
 * ```
 */
export interface Right<R> {
  readonly _tag: 'Right'
  readonly right: R
}

/**
 * Represents a value of one of two possible types (a disjoint union).
 *
 * An instance of Either is either an instance of Left or Right.
 * A common use of Either is as an alternative to Option for dealing with possible
 * missing values. In this usage, None is replaced with a Left which can contain useful information.
 * Right takes the place of Some.
 * Convention dictates that Left is used for failure and Right is used for success.
 *
 * @typeParam L - Type of the Left value
 * @typeParam R - Type of the Right value
 * @example
 * ```typescript
 * import { Either, left, right } from '@funkp/core/Either'
 *
 * const l: Either<string, number> = left('fail')
 * const r: Either<string, number> = right(42)
 *
 * // Pattern matching
 * if (l._tag === 'Left') {
 *   // handle error
 * }
 * if (r._tag === 'Right') {
 *   // handle success
 * }
 * ```
 */
export type Either<L, R> = Left<L> | Right<R>

/**
 * Extracts the Right value type from an {@link Either} type.
 *
 * @typeParam E - The Either type
 * @example
 * ```typescript
 * import { Either, RightType, right } from '@funkp/core/Either'
 *
 * const r = right(123)
 * type R = RightType<typeof r> // number
 * ```
 */
export type RightType<E extends Either<unknown, unknown>> =
  E extends Right<infer R> ? R : never

/**
 * Extracts the Left value type from an {@link Either} type.
 *
 * @typeParam E - The Either type
 * @example
 * ```typescript
 * import { Either, LeftType, left } from '@funkp/core/Either'
 *
 * const l = left('fail')
 * type L = LeftType<typeof l> // string
 * ```
 */
export type LeftType<E extends Either<unknown, unknown>> =
  E extends Left<infer L> ? L : never
