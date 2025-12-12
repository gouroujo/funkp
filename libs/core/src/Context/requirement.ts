import type { Effect } from 'src/Effect'
import { singleShotGen } from 'src/Effect/internal/singleshotgen'
import { yieldWrap } from 'src/Effect/internal/yieldwrap'
import * as Op from 'src/RuntimeOp'
import { Narrow } from 'src/utils'
import { empty } from './empty'

export const Service =
  <Id>(id: Narrow<Id>) =>
  <Self, Shape>(): ServiceClass<Self, Id, Shape> => {
    return class {
      // constructor(impl: Shape) {
      //   return impl as this
      // }
      static id = id as Id
      static context = empty()
      static ops = [Op.inject(id as string)]
      static [Symbol.iterator]() {
        return singleShotGen(yieldWrap(this))
      }
    }
  }

export interface ServiceClass<Self, Id, Shape> extends Effect<
  Shape,
  never,
  Self
> {
  new (impl: Shape): any
  readonly id: Id
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
