import { Either } from 'src/Either'

export const ITERATE_OP = '@funkp/core/operator/iterate' as const
export const iterate =
  <T>(
    fn: (prevValue?: Either<any, any> | undefined) => Generator<any, any, any>,
  ) =>
  (prevValue?: Either<any, any> | undefined) => ({
    _op: ITERATE_OP,
    fn,
    ...(prevValue !== undefined ? { prevValue } : {}),
  })

if (import.meta.vitest) {
  const { describe, it, expect } = import.meta.vitest
  describe('Operation.Iterate', async () => {
    it('should return an iterate operation', () => {
      const operation = iterate(function* () {
        yield 1
      })
      expect(operation()).toMatchInlineSnapshot(`
        {
          "_op": "@funkp/core/operator/iterate",
          "fn": [Function],
        }
      `)
    })
  })
}
