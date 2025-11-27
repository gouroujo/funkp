import type { Operation } from './_op'

export const INJECT_OP = '@funkp/core/operator/inject' as const
export const inject =
  <T>(token: T) =>
  () =>
    ({
      _op: INJECT_OP,
      value: token,
    }) satisfies Operation<T>

if (import.meta.vitest) {
  const { describe, it, expect } = import.meta.vitest
  describe('Operation.Inject', () => {
    it('should return a inject operation', () => {
      const operation = inject('aaa')
      expect(operation()).toMatchInlineSnapshot(`
        {
          "_op": "@funkp/core/operator/inject",
          "value": "aaa",
        }
      `)
    })
  })
}
