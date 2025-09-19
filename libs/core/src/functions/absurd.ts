/**
 * The absurd function. Used for exhaustiveness checking in situations that should be impossible.
 *
 * Calling this function will always throw an error. It is useful in switch/case or pattern matching
 * to handle the `never` type, ensuring all cases are covered.
 *
 * @param _ - A value of type `never` (should be impossible to provide)
 * @throws Always throws an error if called
 * @returns Never returns
 *
 * @example
 * ```typescript
 * import { absurd } from './absurd'
 *
 * type Shape = { kind: 'circle' } | { kind: 'square' }
 *
 * function area(s: Shape): number {
 *   switch (s.kind) {
 *     case 'circle': return 1
 *     case 'square': return 1
 *     default: return absurd(s) // Ensures all cases are handled
 *   }
 * }
 * ```
 */
export function absurd(_?: never): never {
  throw new Error('Function "absurd" should never be called')
}
