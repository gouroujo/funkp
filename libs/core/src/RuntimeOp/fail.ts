import type { Operation } from './_op'

export const FAIL_OP = '@funkp/core/operator/fail' as const
export const fail = <T>(value: T) =>
  ({
    _op: FAIL_OP,
    value,
  }) satisfies Operation<T>

if (import.meta.vitest) {
  const { describe, it, expect } = import.meta.vitest
  describe('Operation.Fail', () => {
    it('should return a fail operation', () => {
      const operation = fail('error')
      expect(operation).toMatchInlineSnapshot(`
        {
          "_op": "@funkp/core/operator/fail",
          "value": "error",
        }
      `)
    })
  })
}
