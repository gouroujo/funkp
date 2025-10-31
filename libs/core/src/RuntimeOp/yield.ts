import { Operation } from './_op'

export const YIELD_OP = '@funkp/core/operator/yield' as const
export const yieldNow = () =>
  ({
    _op: YIELD_OP,
  }) satisfies Operation<void>

if (import.meta.vitest) {
  const { describe, it, expect } = import.meta.vitest
  describe('Operation.YieldNow', () => {
    it('should return a yield operation', () => {
      const operation = yieldNow()
      expect(operation).toMatchInlineSnapshot(`
          {
            "_op": "@funkp/core/operator/yield",
          }
        `)
    })
  })
}
