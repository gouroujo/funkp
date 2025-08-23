export function isObject<T = unknown>(obj: T): obj is T & object {
  return obj !== null && typeof obj === 'object' && !Array.isArray(obj)
}

if (import.meta.vitest) {
  const { describe, it, expect, expectTypeOf } = import.meta.vitest

  describe('isObject', () => {
    it('should return true for empty objects', () => {
      const obj = {}
      expect(isObject(obj)).toBe(true)
    })
    it('should return true for objects', () => {
      const obj = { a: 1, b: 2 } as unknown
      expect(isObject(obj)).toBe(true)
      if (isObject(obj)) {
        expectTypeOf(obj).toEqualTypeOf<object>()
      }
    })

    it('should return false for non-objects', () => {
      expect(isObject(null)).toBe(false)
      expect(isObject(undefined)).toBe(false)
      expect(isObject(42)).toBe(false)
      expect(isObject('string')).toBe(false)
      expect(isObject([])).toBe(false)
    })
  })
}
