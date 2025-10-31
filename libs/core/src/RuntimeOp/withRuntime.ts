import type { Operation } from './_op'

export const WITH_RUNTIME_OP = '@funkp/core/operator/withRuntime' as const
export const withRuntime = () =>
  ({
    _op: WITH_RUNTIME_OP,
  }) satisfies Operation<void>

if (import.meta.vitest) {
  const { describe, it, expect } = import.meta.vitest
  describe('Operation.WithRuntime', () => {
    it('should return a with runtime operation', () => {
      const operation = withRuntime()
      expect(operation).toMatchInlineSnapshot(`
        {
          "_op": "@funkp/core/operator/withRuntime",
        }
      `)
    })
  })
}
