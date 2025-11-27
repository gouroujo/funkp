export const ON_SUCCESS_OP = '@funkp/core/operator/onSuccess' as const
export const onSuccess =
  <T, TReturn>(fn: (value: T) => TReturn) =>
  (value: T) => ({
    _op: ON_SUCCESS_OP,
    fn,
    value,
  })

if (import.meta.vitest) {
  const { describe, it, expect } = import.meta.vitest
  describe('Operation.onSuccess', async () => {
    it('should return an OnSuccess operation', () => {
      const operation = onSuccess((value: number) => `Error: ${value}`)
      expect(operation(23)).toMatchInlineSnapshot(`
        {
          "_op": "@funkp/core/operator/onSuccess",
          "fn": [Function],
          "value": 23,
        }
      `)
    })
  })
}
