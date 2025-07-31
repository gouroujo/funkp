export * from './isNone'
export * from './isSome'
export * from './none'
export * from './some'

/**
 * Represents an optional value: every Option is either Some and contains a value, or None, and does not.
 *
 * @typeParam T - The type of the value
 */
export type Option<T> = Some<T> | None

/**
 * Represents a value present in Option.
 * @typeParam T - The type of the value
 */
export interface Some<T> {
  readonly _tag: 'Some'
  readonly value: T
}

/**
 * Represents the absence of a value in Option.
 */
export interface None {
  readonly _tag: 'None'
}
