import { Either } from '.'

/**
 * Constructs a `Right` value of the `Either` type.
 *
 * The `Right` variant is typically used to represent success or a valid result.
 *
 * @typeParam R - Type of the Right value
 * @param rightValue - The value to wrap in a `Right`
 * @returns An `Either` representing the `Right` value
 *
 * @example
 * ```typescript
 * import { right, Either } from './right'
 *
 * const r: Either<never, number> = right(42)
 * // r is { _tag: 'Right', right: 42 }
 * ```
 */
export const right = <R>(rightValue: R): Either<never, R> => ({
  _tag: 'Right',
  right: rightValue,
})

/**
 * Alias for {@link right}. Useful for functional programming style.
 *
 * @typeParam R - Type of the Right value
 * @param rightValue - The value to wrap in a `Right`
 * @returns An `Either` representing the `Right` value
 *
 * @example
 * ```typescript
 * import { of, Either } from './right'
 *
 * const r: Either<never, string> = of('ok')
 * // r is { _tag: 'Right', right: 'ok' }
 * ```
 */
export const of = right
