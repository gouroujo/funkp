import type { InferredType } from '../function'
import { Apply, Assume, HKT } from '../HKT'

export type TupleRestKey<T extends unknown[]> = {
  [k in keyof T]: k extends keyof T ? (number extends k ? number : never) : k
}[number]
export type TupleRest<T extends unknown[]> = T[TupleRestKey<T>]
export type Tail<T extends unknown[]> = T extends [unknown, ...infer TT]
  ? TT
  : []
export type Head<T extends unknown[]> = T extends [infer TT, ...unknown[]]
  ? TT
  : never
export type Last<T extends unknown[]> = T[number extends T['length']
  ? TupleRestKey<T> | TupleRestKey<Tail<T>>
  : Tail<T>['length']]
export type Union<T extends unknown[]> = T[number]

export type MapTuple<X extends readonly unknown[], F extends HKT> = {
  [K in keyof X]: Apply<F, X[K]>
}

export type InferredTuple = InferredType[] | ReadonlyArray<InferredType>

if (import.meta.vitest) {
  const { describe, it, assertType, expectTypeOf, expect } = import.meta.vitest

  describe('Tuple.MapTuple', () => {
    it('should infer the correct type', () => {
      interface DoubleString extends HKT {
        new: (x: Assume<this['_1'], string>) => `${typeof x}${typeof x}`
      }
      assertType<MapTuple<['hello', 'world'], DoubleString>>([
        'hellohello',
        'worldworld',
      ])
    })
  })

  describe('Tuple.InferredTuple', () => {
    it.skip('should infer the correct type', () => {
      function map<T extends InferredTuple, F extends typeof HKT>(
        x: readonly [...T],
        f: F,
      ): MapTuple<T, Assume<InstanceType<F>, HKT>> {
        return x.map((v, i) => {
          const t = f.constructor(v)
          const t2 = t['_1']
          return t2
        })
      }
      const append = <S extends string>(s: S) =>
        class extends HKT {
          override new = (x: Assume<this['_1'], string>) => `${x}${s}` as const
        }

      const a = map(['a', 'b'], append('!'))
      expectTypeOf(a).toEqualTypeOf<['a!', 'b!']>()
      expect(a).toEqual(['a!', 'b!'])
    })
  })
}
