import { None, none, Option, some } from '.'

/**
 * Type guard to check if an Option is None.
 * @param option - The Option to check
 * @returns true if the Option is None, false otherwise
 * @example
 * ```typescript
 * import { isNone, some, none } from './option'
 * isNone(some(1)) // false
 * isNone(none) // true
 * ```
 */
export function isNone<T>(option: Option<T>): option is None {
  return option._tag === 'None'
}

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest

  it('should return true for None', () => {
    expect(isNone(none())).toBe(true)
  })

  it('should return false for Some', () => {
    expect(isNone(some(1))).toBe(false)
  })
}
