// import { Context, Effect, Error, Success } from '.'
// import { gen } from './gen'
// import { promise } from './promise'

// type Options = {
//   concurrency?: number
// }
// type SuccessMap<E extends Effect<unknown, unknown, unknown>[]> = {
//   [I in keyof E]: Success<E[I]>
// }
// type Union<T extends unknown[]> = T[number]

// export function all<E extends Effect<any, any, any>[]>(
//   effects: [...E],
//   options?: Options,
// ): Effect<SuccessMap<E>, Error<Union<E>>, Context<Union<E>>> {
//     return gen(async function* (){
//       const concurrency = options?.concurrency ?? Infinity
//       const executors =
//     })
// }

// if (import.meta.vitest) {
//   const { describe, it, expect, expectTypeOf } = import.meta.vitest

//   // Helper function to simulate a task with a delay
//   const makeTask = <T>(n: T, delay: number) =>
//     promise(
//       () =>
//         new Promise<T>((resolve) => {
//           console.log(`start task ${n}`) // Logs when the task starts
//           setTimeout(() => {
//             console.log(`task ${n} done`) // Logs when the task finishes
//             resolve(n)
//           }, delay)
//         }),
//     )

//   describe('Effect.fail', () => {
//     it('should sequentially order effect', () => {
//       const task1 = makeTask('a' as const, 200)
//       const task2 = makeTask('b' as const, 100)
//       const task3 = makeTask('c' as const, 210)

//       const numbered = all([task1, task2, task3], {
//         concurrency: 2,
//       })
//       expectTypeOf(numbered).toEqualTypeOf<
//         Effect<['a', 'b', 'c'], never, never>
//       >()
//     })
//   })
// }
