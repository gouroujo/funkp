import { Either } from '.'

/**
 * Constructs a `Left` value of the `Either` type.
 *
 * The `Left` variant is typically used to represent failure or an error.
 *
 * @typeParam L - Type of the Left value
 * @param leftValue - The value to wrap in a `Left`
 * @returns An `Either` representing the `Left` value
 *
 * @example
 * ```typescript
 * import { left, Either } from './left'
 *
 * const l: Either<string, never> = left('error')
 * // l is { _tag: 'Left', left: 'error' }
 * ```
 */
export const left = <L>(leftValue: L): Either<L, never> => ({
  _tag: 'Left',
  left: leftValue,
})
