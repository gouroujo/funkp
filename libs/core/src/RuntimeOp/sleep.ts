import { right } from '../Either'
import { Operation } from './_op'

export const sleep = (value: number): SleepOperation => ({
  _op: 'sleep',
  value,
})
export interface SleepOperation extends Operation {
  _op: 'sleep'
  value: number
}

export const sleepHandler = (op: SleepOperation) =>
  new Promise((resolve) => setTimeout(resolve, op.value)).then(() =>
    right(undefined),
  )

if (import.meta.vitest) {
  const { describe, it, expect } = import.meta.vitest
  describe('Operation.Fail', () => {
    it('should return a fail operation', () => {
      const operation = sleep(42)
      expect(operation).toMatchInlineSnapshot(`
        {
          "_op": "sleep",
          "value": 42,
        }
      `)
    })
  })
}
