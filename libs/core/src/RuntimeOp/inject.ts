import { right } from '../Either'
import { Runtime } from '../Runtime'
import { Operation } from './_op'

export const inject = (value: unknown): InjectOperation => ({
  _op: 'inject',
  value,
})
export interface InjectOperation extends Operation {
  _op: 'inject'
  value: unknown
}

export const injectHandler = (
  op: InjectOperation,
  runtime: Runtime<unknown>,
) => {
  const serviceMap = runtime.context.services
  if (!serviceMap?.has(op.value)) {
    throw new Error(`Service not found "${String(op.value)}"`)
  } else {
    return right(serviceMap.get(op.value))
  }
}

if (import.meta.vitest) {
  const { describe, it, expect } = import.meta.vitest
  describe('Operation.Fail', () => {
    it('should return a fail operation', () => {
      const operation = inject('dep')
      expect(operation).toMatchInlineSnapshot(`
        {
          "_op": "inject",
          "value": "dep",
        }
      `)
    })
  })
}
