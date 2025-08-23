import { isObjectWithKey } from '../object/isObjectWithKey'

export function isGenerator(obj: unknown): obj is Generator {
  return (
    isObjectWithKey(obj, ['next', 'throw']) &&
    typeof obj.next == 'function' &&
    typeof obj.throw == 'function'
  )
}

if (import.meta.vitest) {
  const { describe, it, expect, expectTypeOf } = import.meta.vitest

  describe('isGenerator', () => {
    it('should return true for generators', () => {
      function* gen() {
        yield 1
      }
      const generator = gen() as unknown
      expect(isGenerator(generator)).toBe(true)
      if (isGenerator(generator)) {
        expectTypeOf(generator).toEqualTypeOf<Generator>()
      }
    })

    it('should return false for non-generators', () => {
      expect(isGenerator(null)).toBe(false)
      expect(isGenerator(undefined)).toBe(false)
      expect(isGenerator(42)).toBe(false)
      expect(isGenerator({})).toBe(false)
      expect(isGenerator([])).toBe(false)
    })
  })
}
