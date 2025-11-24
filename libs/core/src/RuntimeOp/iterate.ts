export const ITERATE_OP = '@funkp/core/operator/iterate' as const
export const iterate = <T>(fn: () => Iterator<any, any, any>) => ({
  _op: ITERATE_OP,
  fn,
})

if (import.meta.vitest) {
  const { describe, it, expect } = import.meta.vitest
  describe('Operation.Iterate', async () => {
    it('should return an iterate operation', () => {
      const operation = iterate(function* () {
        yield 1
      })
      expect(operation).toMatchInlineSnapshot()
    })
  })
}
