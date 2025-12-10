import { Effect } from '../effect'
import { effectable } from '../internal/effectable'

export const provide = <Success, Failure, Context, Service>(
  service: Service,
  implementation: any,
): ((
  effect: Effect<Success, Failure, Context>,
) => Effect<Success, Failure, Exclude<Context, Service>>) => {
  return (effect) => effectable([...effect.ops])
}

if (import.meta.vitest) {
  const { describe, it, expect, expectTypeOf } = import.meta.vitest
  const Effect = await import('src/Effect')
  const Context = await import('src/Context')

  class Random extends Context.Service('MyRandomService')<
    Random,
    { readonly next: Effect<number> }
  >() {}

  describe('Effect.provide', async () => {
    it('should provide a service to an effect', async () => {
      const effect = Effect.gen(function* () {
        const random = yield* Random
        const value = yield* random.next
        return value
      })
      expectTypeOf(effect).toEqualTypeOf<Effect<number, never, Random>>()
      const providedEffect = Effect.provide(Random, {
        next: Effect.succeed(3),
      })(effect)
      expectTypeOf(providedEffect).toEqualTypeOf<Effect<number, never, never>>()
      await expect(Effect.runPromise(providedEffect)).resolves.toEqual(3)
    })
  })
}
