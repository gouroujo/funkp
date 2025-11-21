export const DELEGATE_OP = '@funkp/core/operator/delegate' as const
export const child = <T>(effect: T) => ({
  _op: DELEGATE_OP,
  effect,
})

if (import.meta.vitest) {
  const { describe, it, expect } = import.meta.vitest
  describe('Operation.Delegate', async () => {
    const { succeed } = await import('src/Effect')
    it('should return a child operation', () => {
      const effect = succeed(42)
      const operation = child(effect)
      expect(operation).toMatchInlineSnapshot(`
        {
          "_op": "@funkp/core/operator/delegate",
          "value": {
            Symbol(Symbol.iterator): [Function],
          },
        }
      `)
    })
  })
}
