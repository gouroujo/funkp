import { isArray } from '../array/isArray'
import { isObject } from './isObject'

export function isObjectWithKey<K extends PropertyKey, T = unknown>(
  obj: T,
  keys: K | K[],
): obj is T & object & Record<K, unknown> {
  const k: K[] = isArray(keys) ? keys : [keys]
  return isObject(obj) && k.every((key) => key in obj)
}

if (import.meta.vitest) {
  const { describe, it, expect, expectTypeOf } = import.meta.vitest

  describe('isObjectWithKey', () => {
    it('should return true for objects with a single specified key', () => {
      const obj = { a: 1 } as unknown
      if (isObjectWithKey(obj, 'a')) {
        expectTypeOf(obj.a).toEqualTypeOf<unknown>()
      }
      expect(isObjectWithKey(obj, 'a')).toBe(true)
    })
    it('should return true for objects with specified keys', () => {
      const obj = { a: 1, b: 2 } as unknown
      if (isObjectWithKey(obj, ['a', 'b'])) {
        expectTypeOf(obj.a).toEqualTypeOf<unknown>()
        expectTypeOf(obj.b).toEqualTypeOf<unknown>()
      }
      expect(isObjectWithKey(obj, ['a', 'b'])).toBe(true)
      expect(isObjectWithKey(obj, ['b'])).toBe(true)
    })

    it('should return false for empty objects', () => {
      const obj = {}
      expect(isObjectWithKey(obj, 'a')).toBe(false)
    })

    it('should return false for objects without specified keys', () => {
      const obj = { a: 1 }
      expect(isObjectWithKey(obj, ['b'])).toBe(false)
    })

    it('should return false for non-object types', () => {
      expect(isObjectWithKey(null, ['a'])).toBe(false)
      expect(isObjectWithKey(undefined, ['a'])).toBe(false)
      expect(isObjectWithKey(42, ['a'])).toBe(false)
    })
  })
}
