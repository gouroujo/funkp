export const ON_FAILURE_OP = '@funkp/core/operator/onFailure' as const
export const onFailure =
  <T, TReturn>(fn: (value: T) => TReturn) =>
  (value: any) => ({
    _op: ON_FAILURE_OP,
    fn,
    value,
  })

if (import.meta.vitest) {
  const { describe, it, expect } = import.meta.vitest
  describe('Operation.onFailure', async () => {
    it('should return an onFailure operation', () => {
      const operation = onFailure((value: number) => `Error: ${value}`)
      expect(operation('fail')).toMatchInlineSnapshot(`
        {
          "_op": "@funkp/core/operator/onFailure",
          "fn": [Function],
          "value": "fail",
        }
      `)
    })
  })
}
