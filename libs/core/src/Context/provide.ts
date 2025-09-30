import { Effect, gen, map, runPromise, succeed } from '../Effect'
import { pipe } from '../functions'
import {
  Requirement,
  RequirementContainer,
  RequirementFactory,
} from './requirement'

export function provide<Service, R extends RequirementContainer<Service>>(
  requirement: R,
  implementation: Service,
) {
  return <S, E, A extends Requirement>(
    effect: Effect<S, E, A>,
  ): Effect<S, E, Exclude<A, InstanceType<R>>> => {
    effect.context ??= {}
    effect.context.services ??= new Map()
    effect.context.services.set(requirement.id, implementation)
    return effect as Effect<S, E, Exclude<A, InstanceType<R>>>
  }
}

if (import.meta.vitest) {
  const { describe, it, expect, expectTypeOf } = import.meta.vitest

  class Random extends RequirementFactory('MyRandomService')<
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
