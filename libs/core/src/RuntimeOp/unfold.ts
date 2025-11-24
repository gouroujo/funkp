export const UNFOLD_OP = '@funkp/core/operator/unfold' as const
export const unfold = <T>() => ({
  _op: UNFOLD_OP,
})

if (import.meta.vitest) {
  const { describe, it, expect } = import.meta.vitest
  describe('Operation.Unfold', async () => {
    it('should return an unfold operation', () => {
      const operation = unfold()
      expect(operation).toMatchInlineSnapshot(`
        {
          "_op": "@funkp/core/operator/unfold",
        }
      `)
    })
  })
}
