import { Operation } from '.'

export const ASYNC_OP = '@funkp/core/operator/async' as const
export const promise =
  <Success, Failure = never>(
    fn: () => Promise<Success>,
    catchFn?: (e: unknown) => Failure,
  ): (() => Operation<Success, Failure, never>) =>
  () => ({
    _op: ASYNC_OP,
    fn,
    ...(catchFn ? { catchFn } : {}),
  })

if (import.meta.vitest) {
  const { describe, it, expect } = import.meta.vitest
  describe('Operation.Async', () => {
    it('should return a async operation', () => {
      const operation = promise(() => Promise.resolve('ok'))
      expect(operation()).toMatchInlineSnapshot(`
        {
          "_op": "@funkp/core/operator/async",
          "fn": [Function],
        }
      `)
    })
  })
}
