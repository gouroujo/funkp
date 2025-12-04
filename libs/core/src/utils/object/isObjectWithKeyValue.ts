import { isArray } from '../array/isArray'
import type { Narrow } from '../function/narrow'
import { isObjectWithKey } from './isObjectWithKey'

type ZipTuple<T extends readonly any[], U extends readonly any[]> = {
  [K in keyof T]: [T[K], K extends keyof U ? U[K] : never]
}

export function isObjectWithKeyValue<K extends PropertyKey, V, T = unknown>(
  obj: T,
  key: K,
  value: Narrow<V>,
): obj is T & object & Record<K, V>
export function isObjectWithKeyValue<
  K extends PropertyKey[],
  V extends { [T in keyof K]: unknown },
  T = unknown,
>(
  obj: T,
  keys: [...K],
  values: Narrow<[...V]>,
): obj is T & object & { [T in ZipTuple<K, V>[number] as T[0]]: T[1] }
export function isObjectWithKeyValue<K extends PropertyKey, V, T = unknown>(
  obj: T,
  keys: K | K[],
  values: V | V[],
): obj is T & object & Record<K, unknown> {
  const k: K[] = isArray(keys) ? keys : [keys]
  const v: V[] = isArray(values) ? (values as V[]) : [values]
  return isObjectWithKey(obj, k) && k.every((key, i) => obj[key] === v[i])
}

if (import.meta.vitest) {
  const { describe, it, expect, expectTypeOf } = import.meta.vitest

  describe('isObjectWithKey', () => {
    it('should return true for objects with a single specified key', () => {
      const obj = { a: 1 } as unknown
      if (isObjectWithKeyValue(obj, 'a', 'foo')) {
        expectTypeOf(obj.a).toEqualTypeOf<'foo'>()
      }
      expect(isObjectWithKeyValue(obj, 'a', 1)).toBe(true)
    })
    it('should return true for objects with multiple specified keys', () => {
      const obj = { a: 'foo', b: 'bar' } as unknown
      if (isObjectWithKeyValue(obj, ['a', 'b'], ['foo', 'bar'])) {
        expectTypeOf(obj.a).toEqualTypeOf<'foo'>()
        expectTypeOf(obj.b).toEqualTypeOf<'bar'>()
      }
      expect(isObjectWithKeyValue(obj, ['a', 'b'], ['foo', 'bar'])).toBe(true)
    })
  })
}
