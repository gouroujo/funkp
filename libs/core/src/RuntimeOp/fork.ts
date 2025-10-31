import type { Effect } from '../Effect'
import type { Operation } from './_op'

export const FORK_OP = '@funkp/core/operator/fork' as const
export const fork = <T extends Effect<any>>(effect: T) =>
  ({
    _op: FORK_OP,
    value: effect,
  }) satisfies Operation<T>

if (import.meta.vitest) {
  const { describe, it, expect } = import.meta.vitest
  describe('Operation.Fork', async () => {
    const { succeed } = await import('../Effect/constructors')
    it('should return a fork operation', () => {
      const effect = succeed(42)
      const operation = fork(effect)
      expect(operation).toMatchInlineSnapshot(`
        {
          "_op": "@funkp/core/operator/fork",
          "value": {
            Symbol(Symbol.iterator): [Function],
          },
        }
      `)
    })
  })
}
