import { Effect } from 'src/Effect'
import { Either } from 'src/Either'

export const PARALLEL_OP = '@funkp/core/operator/parallel' as const
export const parallel =
  <T>(effects: Effect<any, any, any>[], concurrency: number) =>
  (prevValue?: Either<any, any> | undefined) => ({
    _op: PARALLEL_OP,
    concurrency,
    effects,
    ...(prevValue !== undefined ? { prevValue } : {}),
  })

if (import.meta.vitest) {
  const { describe, it, expect } = import.meta.vitest
  describe('Operation.Iterate', async () => {
    const { succeed } = await import('src/Effect')
    it('should return an parallel operation', () => {
      const operation = parallel([succeed(1)], 1)
      expect(operation()).toMatchInlineSnapshot(`
        {
          "_op": "@funkp/core/operator/parallel",
          "concurrency": 1,
          "effects": [
            {
              "context": {
                "services": Map {},
              },
              "ops": [
                [Function],
              ],
              Symbol(Symbol.iterator): [Function],
            },
          ],
        }
      `)
    })
  })
}
