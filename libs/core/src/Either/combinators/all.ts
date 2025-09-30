import { Either, isLeft, Left, LeftType, Right, RightType } from '..'
import { right } from '../constructors'

export function all<T extends readonly Either<unknown, unknown>[]>(
  tuple: [...T],
): Either<LeftType<T[number]>, { [K in keyof T]: RightType<T[K]> }> {
  {
    const result: unknown[] = []
    for (let i = 0; i < tuple.length; i++) {
      const e = tuple[i]
      if (isLeft(e)) {
        return e as Left<LeftType<T[number]>>
      } else {
        result.push(e.right)
      }
    }
    return right(result) as Right<{ [K in keyof T]: RightType<T[K]> }>
  }
}

if (import.meta.vitest) {
  const { it, describe, expect, expectTypeOf } = import.meta.vitest
  describe('Either.all', async () => {
    const { right, left } = await import('../constructors')
    it('should return all Right value in order', () => {
      const a = right(42)
      const b = right('hello')
      const combined = all([a, b])
      expectTypeOf(combined).toEqualTypeOf<Either<never, [number, string]>>()
      expect(combined).toEqualRight([42, 'hello'])
    })
    it('should return the first Left value', () => {
      const a = left(42)
      const b = right('hello')
      const combined = all([a, b])
      expectTypeOf(combined).toEqualTypeOf<Either<number, [never, string]>>()
      expect(combined).toEqualLeft(42)
    })
  })
}
