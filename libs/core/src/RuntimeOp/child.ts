import type { Effect } from '../Effect'
import type { Operation } from './_op'

export const CHILD_OP = '@funkp/core/operator/child' as const
export const child = <T extends Effect<any>>(effect: T) =>
  ({
    _op: CHILD_OP,
    value: effect,
  }) satisfies Operation<T>

if (import.meta.vitest) {
  const { describe, it, expect } = import.meta.vitest
  describe('Operation.Fork', async () => {
    const { succeed } = await import('../Effect/constructors')
    it('should return a child operation', () => {
      const effect = succeed(42)
      const operation = child(effect)
      expect(operation).toMatchInlineSnapshot(`
        {
          "_op": "@funkp/core/operator/child",
          "value": {
            Symbol(Symbol.iterator): [Function],
          },
        }
      `)
    })
  })
}
