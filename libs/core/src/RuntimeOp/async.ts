import { right } from '../Either'
import { Operation } from './_op'

export const ASYNC_OP = Symbol('@funkp/core/operator/promise')
export const promise = <T>(value: Promise<T>) => ({
  _op: ASYNC_OP,
  value,
})

export interface AsyncOperation extends Operation {
  _op: typeof ASYNC_OP
  value: Promise<unknown>
}
export const asyncHandler = (op: AsyncOperation) => op.value.then(right)

if (import.meta.vitest) {
  const { describe, it, expect } = import.meta.vitest
  describe('Operation.Fail', () => {
    it('should return a fail operation', () => {
      const operation = promise(Promise.resolve(42))
      expect(operation).toMatchInlineSnapshot(`
        {
          "_op": "async",
          "value": Promise {},
        }
      `)
    })
  })
}
