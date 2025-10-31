import type { Operation } from './_op'

export const ASYNC_OP = '@funkp/core/operator/async' as const
export const promise = <T>(value: Promise<T>) =>
  ({
    _op: ASYNC_OP,
    value,
  }) satisfies Operation<Promise<T>>

if (import.meta.vitest) {
  const { describe, it, expect } = import.meta.vitest
  describe('Operation.Async', () => {
    it('should return a async operation', () => {
      const operation = promise(Promise.resolve('ok'))
      expect(operation).toMatchInlineSnapshot(`
        {
          "_op": "@funkp/core/operator/async",
          "value": Promise {},
        }
      `)
    })
  })
}
