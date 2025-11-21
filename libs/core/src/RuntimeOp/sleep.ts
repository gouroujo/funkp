export const SLEEP_OP = '@funkp/core/operator/sleep' as const
export const sleep = (ms: number) => ({
  _op: SLEEP_OP,
  ms,
})

if (import.meta.vitest) {
  const { describe, it, expect } = import.meta.vitest
  describe('Operation.Sleep', () => {
    it('should return a sleep operation', () => {
      const operation = sleep(10)
      expect(operation).toMatchInlineSnapshot(`
        {
          "_op": "@funkp/core/operator/sleep",
          "ms": 10,
        }
      `)
    })
  })
}
