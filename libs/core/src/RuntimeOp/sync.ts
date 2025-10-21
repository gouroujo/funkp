import { Either } from '../Either'
import { Operation } from './_op'

export const sync = (value: Either<unknown, unknown>): SyncOperation => ({
  _op: 'sync',
  value,
})
export interface SyncOperation extends Operation {
  _op: 'sync'
  value: Either<unknown, unknown>
}

export const syncHandler = (op: SyncOperation) => op.value

if (import.meta.vitest) {
  const { describe, it, expect } = import.meta.vitest
  describe('Operation.Fail', async () => {
    const { right } = await import('../Either')

    it('should return a sync operation', () => {
      const operation = sync(right(42))
      expect(operation).toMatchInlineSnapshot(`
        {
          "_op": "sync",
          "value": {
            "_tag": "Right",
            "right": 42,
          },
        }
      `)
    })
  })
}
