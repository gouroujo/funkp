import { Option, Some } from '..'

/**
 * Type guard to check if an Option is Some.
 * @param option - The Option to check
 * @returns true if the Option is Some, false otherwise
 * @example
 * ```typescript
 * import { isSome, some, none } from './option'
 * isSome(some(1)) // true
 * isSome(none) // false
 * ```
 */
export function isSome<T>(option: Option<T>): option is Some<T> {
  return option._tag === 'Some'
}
