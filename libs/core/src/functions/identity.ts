/**
 * The identity function. Returns the input value unchanged.
 *
 * Useful as a default or placeholder function, or in functional programming pipelines.
 *
 * @typeParam T - The type of the input and output value
 * @param value - The value to return
 * @returns The same value that was passed in
 *
 * @example
 * ```typescript
 * import { identity } from '@funkp/core'
 *
 * identity(42) // 42
 * identity('hello') // 'hello'
 * identity([1, 2, 3]) // [1, 2, 3]
 *
 * // In a pipeline
 * [1, 2, 3].map(identity) // [1, 2, 3]
 * ```
 */
export const identity = <T>(value: T): T => value

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest

  it('should return the input value', () => {
    const input = 42
    const result = identity(input)
    expect(result).toBe(input)
  })

  it('should work with different types', () => {
    const inputString = 'hello'
    const resultString = identity(inputString)
    expect(resultString).toBe(inputString)

    const inputArray = [1, 2, 3]
    const resultArray = identity(inputArray)
    expect(resultArray).toEqual(inputArray)
  })
}
