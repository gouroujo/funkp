import type { Operation } from './_op'

export const PURE_OP = '@funkp/core/operator/pure' as const
export const pure = <T>(value: T) =>
  ({
    _op: PURE_OP,
    value,
  }) satisfies Operation<T>

if (import.meta.vitest) {
  const { describe, it, expect } = import.meta.vitest
  describe('Operation.Pure', () => {
    it('should return a pure operation', () => {
      const operation = pure('aaa')
      expect(operation).toMatchInlineSnapshot(`
        {
          "_op": "@funkp/core/operator/pure",
          "value": "aaa",
        }
      `)
    })
  })
}
