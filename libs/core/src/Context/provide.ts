import { Effect, gen, map, runPromise, succeed } from '../Effect'
import { injectFiber } from '../Fiber/inject'
import { pipe } from '../functions'
import { Service, ServiceContainer } from './requirement'

export function provide<Impl, R extends ServiceContainer<Impl>>(
  requirement: R,
  implementation: Impl,
) {
  return <S, E, A extends InstanceType<R>>(
    effect: Effect<S, E, A>,
  ): Effect<S, E, Exclude<A, InstanceType<R>>> => ({
    *[Symbol.iterator]() {
      const fiber = yield* injectFiber()
      fiber.context ??= {}
      fiber.context.services ??= new Map()
      fiber.context.services.set(requirement.id, implementation)
      return yield* effect
    },
  })
}

if (import.meta.vitest) {
  const { describe, it, expect, expectTypeOf } = import.meta.vitest

  class Random extends Service('MyRandomService')<
    Random,
    { readonly next: Effect<number> }
  >() {}

  describe('Context.provide', async () => {
    it('should provide a service to an effect', async () => {
      const effect = gen(function* () {
        const random = yield* Random
        const value = yield* random.next
        return value
      })
      expectTypeOf(effect).toEqualTypeOf<Effect<number, never, Random>>()
      const providedEffect = provide(Random, { next: succeed(3) })(effect)
      expectTypeOf(providedEffect).toEqualTypeOf<Effect<number, never, never>>()
      const result = await runPromise(providedEffect)
      expect(result).toEqual({
        _tag: 'Right',
        right: 3,
      })
    })
    it('should provide a service to  mapped effect', async () => {
      const effect = pipe(
        gen(function* () {
          const random = yield* Random
          const value = yield* random.next
          return value
        }),
        map((r) => r + 1),
        map((r) => r + 2),
      )
      expectTypeOf(effect).toEqualTypeOf<Effect<number, never, Random>>()
      const providedEffect = provide(Random, { next: succeed(1) })(effect)
      expectTypeOf(providedEffect).toEqualTypeOf<Effect<number, never, never>>()
      const result = await runPromise(providedEffect)
      expect(result).toEqual({
        _tag: 'Right',
        right: 4,
      })
    })
  })
}
