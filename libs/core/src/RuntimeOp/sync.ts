import type { Operation } from './_op'

export const SYNC_OP = '@funkp/core/operator/sync' as const
export const sync = <T>(value: T) =>
  ({
    _op: SYNC_OP,
    value,
  }) satisfies Operation<T>

if (import.meta.vitest) {
  const { describe, it, expect } = import.meta.vitest
  describe('Operation.Sync', () => {
    it('should return a sync operation', () => {
      const operation = sync('aaa')
      expect(operation).toMatchInlineSnapshot(`
        {
          "_op": "@funkp/core/operator/sync",
          "value": "aaa",
        }
      `)
    })
  })
}
