import type { Effect } from 'src/Effect'
import { singleShotGen } from 'src/Effect/internal/singleshotgen'
import { YieldWrap, yieldWrap } from 'src/Effect/internal/yieldwrap'

// export interface TagClassShape<Id, Shape> {
//   readonly [TagTypeId]: TagTypeId
//   readonly Type: Shape
//   readonly Id: Id
// }

// export interface Tag<in out Id, in out Value> {
//   readonly _op: 'Tag'
//   readonly Service: Value
//   readonly Identifier: Id
//   // of(self: Value): Value
// }

export interface Tag<Id, Value> {
  readonly Service: Value
  readonly Identifier: Id
}

export const Service =
  <Id extends string>(id: Id) =>
  <Self, Shape>(): TagClass<Self, Id, Shape> => {
    return class {
      // constructor(impl: Shape) {
      //   return impl as this
      // }
      readonly id = id as Id
      static id = id as Id
      static Identifier = this as Self
      static Service: Shape
      static [Symbol.iterator]() {
        return singleShotGen(yieldWrap(this))
      }
    }
  }

export interface TagClass<Self, Id, Shape>
  extends Tag<Self, Shape>, Iterable<YieldWrap<Self>, Shape> {
  new (impl: Shape): { id: Id }
  readonly id: Id
  readonly Identifier: Self
  readonly Service: Shape
}

if (import.meta.vitest) {
  const { describe, it, expectTypeOf } = import.meta.vitest
  const Context = await import('src/Context')
  const Effect = await import('src/Effect')

  describe('Context.Service', () => {
    it('should create a service', () => {
      class Random extends Context.Service('MyRandomService')<
        Random,
        { readonly next: number }
      >() {}
      const program = Effect.gen(function* () {
        const random = yield* Random
        expectTypeOf(random).toEqualTypeOf<{ readonly next: number }>()
        return random.next
      })
      expectTypeOf(program).toEqualTypeOf<Effect<number, never, Random>>()
    })
  })
}
