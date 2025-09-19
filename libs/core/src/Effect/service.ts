// import { SyncEffect } from '.'
// import { gen } from './gen'
// import { succeed } from './succeed'

// export const isRequirement = (value: unknown): value is Requirement =>
//   typeof value === 'object' &&
//   value !== null &&
//   '_tag' in value &&
//   value._tag === 'requirement'

// export type Requirement = {
//   _tag: 'requirement'
//   id: string
// }
// export type RequirementContainer<Shape> = {
//   new (): Requirement
//   id: string
//   [Symbol.iterator](): Generator<Requirement, Shape, Shape>
// }

// export const Requirement =
//   (id: string) =>
//   <Self, Shape>() => {
//     return class {
//       _tag = 'requirement' as const
//       id: string = id
//       static id = id
//       static *[Symbol.iterator](): Generator<Self, Shape, Shape> {
//         const value = yield { _tag: 'requirement', id } as Self
//         return value
//       }
//     }
//   }

// if (import.meta.vitest) {
//   const { describe, it, expect, expectTypeOf } = import.meta.vitest

//   class Random extends Requirement('MyRandomService')<
//     Random,
//     { readonly next: SyncEffect<number> }
//   >() {}

//   describe('Service', () => {
//     it('should combine with requirements', () => {
//       const effect1 = gen(function* () {
//         const req = yield* Random
//         const value = yield* req.next
//         return `effect${value}`
//       })
//       const effect2 = succeed('effect2' as const)
//       const combined = gen(function* () {
//         const a = yield* effect1
//         const b = yield* effect2
//         return `Combined: ${a}, ${b}` as const
//       })
//       expectTypeOf(combined).toEqualTypeOf<
//         SyncEffect<`Combined: ${string}, effect2`, never, Random>
//       >()
//     })
//   })
// }
