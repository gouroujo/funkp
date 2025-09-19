// import { SyncEffect } from '.'
// import { Left } from '../Either'
// import { gen } from './gen'
// import { run } from './run'
// import { Requirement, RequirementContainer, isRequirement } from './service'
// import { succeed } from './succeed'

// export function provide<Service, R extends RequirementContainer<Service>>(
//   requirement: R,
//   implementation: Service,
// ) {
//   return <S, E, A extends Requirement>(
//     effect: SyncEffect<S, E, A>,
//   ): SyncEffect<S, E, Exclude<A, InstanceType<R>>> => {
//     return gen(function* () {
//       const iterator = effect[Symbol.iterator]()
//       let result = iterator.next()
//       while (!result.done) {
//         if (isRequirement(result.value) && result.value.id === requirement.id) {
//           result = iterator.next(implementation)
//         } else {
//           yield result.value as Left<E> // TODO: Typing need to be adjusted
//           result = iterator.next()
//         }
//       }
//       return result.value
//     })
//   }
// }

// if (import.meta.vitest) {
//   const { describe, it, expect, expectTypeOf } = import.meta.vitest

//   class Random extends Requirement('MyRandomService')<
//     Random,
//     { readonly next: SyncEffect<number> }
//   >() {}

//   describe('provide', () => {
//     it('should provide a service to an effect', () => {
//       const effect = gen(function* () {
//         const random = yield* Random
//         const value = yield* random.next
//         return value
//       })
//       expectTypeOf(effect).toEqualTypeOf<SyncEffect<number, never, Random>>()
//       const providedEffect = provide(Random, { next: succeed(3) })(effect)
//       expectTypeOf(providedEffect).toEqualTypeOf<
//         SyncEffect<number, never, never>
//       >()
//       const result = run(providedEffect)
//       expect(result).toEqual({
//         _tag: 'Right',
//         right: 3,
//       })
//     })
//   })
// }
