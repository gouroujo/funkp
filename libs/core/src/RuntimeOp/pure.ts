import { right } from '../Either'
import { Operation } from './_op'

export const pure = (value: unknown): PureOperation => ({
  _op: 'pure',
  value,
})
export interface PureOperation extends Operation {
  _op: 'pure'
  value: unknown
}

export const pureHandler = (op: PureOperation) => right(op.value)

if (import.meta.vitest) {
  const { describe, it, expect } = import.meta.vitest
  describe('Operation.Fail', () => {
    it('should return a pure operation', () => {
      const operation = pure(42)
      expect(operation).toMatchInlineSnapshot(`
        {
          "_op": "pure",
          "value": 42,
        }
      `)
    })
  })
}
