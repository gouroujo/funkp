import { Option } from '.'

/**
 * Constructs a Some value.
 * @param value - The value to wrap
 * @returns An Option containing the value
 * @example
 * ```typescript
 * import { some, Option } from './option'
 * const o: Option<number> = some(42)
 * // o is { _tag: 'Some', value: 42 }
 * ```
 */
export function some<T>(value: T): Option<T> {
  return { _tag: 'Some', value }
}

export const of = some
