import type { GenericFunc } from '../function'

export abstract class HKT {
  readonly _1?: unknown
  new: GenericFunc = () => null
}
export type Assume<T, U> = T extends U ? T : U
export type Apply<F extends HKT, _1> = ReturnType<
  (F & {
    readonly _1: _1
  })['new']
>

if (import.meta.vitest) {
  const { describe, it, assertType } = import.meta.vitest

  describe('HKT.Apply', () => {
    it('should infer the correct type', () => {
      interface DoubleString extends HKT {
        new: (x: Assume<this['_1'], string>) => `${typeof x}${typeof x}`
      }
      assertType<Apply<DoubleString, 'hi!'>>('hi!hi!')
    })
  })
}
