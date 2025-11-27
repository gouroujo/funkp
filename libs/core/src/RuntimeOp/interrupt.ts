import type { Operation } from './_op'

export const INTERRUPT_OP = '@funkp/core/operator/interrupt' as const
export const interrupt = () => () =>
  ({
    _op: INTERRUPT_OP,
  }) satisfies Operation<void>

if (import.meta.vitest) {
  const { describe, it, expect } = import.meta.vitest
  describe('Operation.Interrupt', () => {
    it('should return a with interrupt operation', () => {
      const operation = interrupt()
      expect(operation()).toMatchInlineSnapshot(`
        {
          "_op": "@funkp/core/operator/interrupt",
        }
      `)
    })
  })
}
