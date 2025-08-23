export function isArray<T = unknown>(obj: T): obj is T & unknown[] {
  return Array.isArray(obj)
}
if (import.meta.vitest) {
  const { describe, it, expect, expectTypeOf } = import.meta.vitest

  describe('isArray', () => {
    it('should return true for arrays', () => {
      const arr = [1, 2, 3] as unknown
      expect(isArray(arr)).toBe(true)
      if (isArray(arr)) {
        expectTypeOf(arr).toEqualTypeOf<unknown[]>()
      }
    })

    it('should return false for non-arrays', () => {
      expect(isArray(null)).toBe(false)
      expect(isArray(undefined)).toBe(false)
      expect(isArray(42)).toBe(false)
      expect(isArray({})).toBe(false)
    })
  })
}