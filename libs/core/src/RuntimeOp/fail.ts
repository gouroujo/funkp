import { left } from '../Either'
import { Operation } from './_op'

export const fail = (value: unknown): FailOperation => ({
  _op: 'fail',
  value,
})
export interface FailOperation extends Operation {
  _op: 'fail'
  value: unknown
}

export const failHandler = (op: FailOperation) => left(op.value)

if (import.meta.vitest) {
  const { describe, it, expect } = import.meta.vitest
  describe('Operation.Fail', () => {
    it('should return a fail operation', () => {
      const operation = fail('error')
      expect(operation).toMatchInlineSnapshot(`
        {
          "_op": "fail",
          "value": "error",
        }
      `)
    })
  })
}
