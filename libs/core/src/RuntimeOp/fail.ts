import { Operation } from '.'

export const FAIL_OP = '@funkp/core/operator/fail' as const
export const fail =
  <Failure>(failure: Failure): (() => Operation<never, Failure, never>) =>
  () => ({
    _op: FAIL_OP,
    failure,
  })

if (import.meta.vitest) {
  const { describe, it, expect } = import.meta.vitest
  describe('Operation.Fail', () => {
    it('should return a fail operation', () => {
      const operation = fail('error')
      expect(operation()).toMatchInlineSnapshot(`
        {
          "_op": "@funkp/core/operator/fail",
          "failure": "error",
        }
      `)
    })
  })
}
