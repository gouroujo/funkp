export function isGeneratorFunction(obj: unknown): obj is GeneratorFunction {
  return (
    typeof obj === 'function' &&
    obj.constructor &&
    obj.constructor.name === 'GeneratorFunction'
  )
}

if (import.meta.vitest) {
  const { describe, it, expect, expectTypeOf } = import.meta.vitest

  describe('isGeneratorFunction', () => {
    it('should return true for generator functions', () => {
      function* gen() {
        yield 1
      }
      expect(isGeneratorFunction(gen)).toBe(true)
      const genFunc = gen as unknown
      if (isGeneratorFunction(genFunc)) {
        expectTypeOf(genFunc).toEqualTypeOf<GeneratorFunction>()
      }
    })

    it('should return false for non-generator functions', () => {
      expect(
        isGeneratorFunction(function () {
          return 1
        }),
      ).toBe(false)
      expect(isGeneratorFunction(() => 'foo')).toBe(false)
      expect(isGeneratorFunction(null)).toBe(false)
      expect(isGeneratorFunction(undefined)).toBe(false)
      expect(isGeneratorFunction(42)).toBe(false)
      expect(isGeneratorFunction({})).toBe(false)
      expect(isGeneratorFunction([])).toBe(false)
    })
  })
}
