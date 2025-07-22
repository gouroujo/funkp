export const identity = <T>(x: T): T => x

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
