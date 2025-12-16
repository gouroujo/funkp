import * as Context from 'src/Context'
import type { Effect } from '../effect'
import { effectable } from '../internal/effectable'

export const provideService = <Id, Service>(
  tag: Context.Tag<Id, Service>,
  implementation: Service,
): (<Success, Failure, Requirements>(
  effect: Effect<Success, Failure, Requirements>,
) => Effect<Success, Failure, Exclude<Requirements, Id>>) => {
  const provider = Context.add(tag, implementation)
  return (effect) => effectable([...effect.ops], provider(effect.context))
}

if (import.meta.vitest) {
  const { describe, it, expect, expectTypeOf } = import.meta.vitest
  const Effect = await import('src/Effect')
  const Context = await import('src/Context')

  class Random extends Context.Service('MyRandomService')<
    Random,
    { readonly next: Effect<number> }
  >() {}
  class Service2 extends Context.Service('MyRandomService2')<
    Service2,
    { readonly aaa: 'foo' }
  >() {}

  describe('Effect.provide', async () => {
    it('should provide a service to an effect', async () => {
      const program = Effect.gen(function* () {
        const random = yield* Random
        const value = yield* random.next
        return value
      })
      expectTypeOf(program).toEqualTypeOf<Effect<number, never, Random>>()
      const providedEffect = Effect.provideService(Random, {
        next: Effect.succeed(3),
      })(program)
      expectTypeOf(providedEffect).toEqualTypeOf<Effect<number, never>>()
      await expect(Effect.runPromise(providedEffect)).resolves.toEqual(3)
    })
    it('should provide one service at a time', async () => {
      const program = Effect.gen(function* () {
        yield* Service2
        const random = yield* Random
        return yield* random.next
      })
      expectTypeOf(program).toEqualTypeOf<
        Effect<number, never, Random | Service2>
      >()
      const providedEffect = Effect.provideService(Random, {
        next: Effect.succeed(3),
      })(program)
      expectTypeOf(providedEffect).toEqualTypeOf<
        Effect<number, never, Service2>
      >()
    })
  })
}
