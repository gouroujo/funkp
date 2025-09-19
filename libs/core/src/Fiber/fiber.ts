import { Brand } from '../Brand'
import { Effect, gen, map, promise, runPromise, succeed } from '../Effect'
import { Either } from '../Either'
import { pipe } from '../functions'

export type FiberStatus = 'Running' | 'Suspended' | 'Done'

export type FiberId = string & Brand<'FiberId'>

export interface Fiber<Success, Failure> {
  status: FiberStatus
  id: FiberId
  parentId?: FiberId
  childs: Fiber<any, any>[]
  listeners: ((result: Either<Failure, Success>) => void)[]
  callStack: ((prevValue?: any) => Effect<any, any, never>)[]
  //   effect: Effect<Success, Failure, never>
}

if (import.meta.vitest) {
  const { it, describe, expect } = import.meta.vitest

  describe('test', () => {
    it('should work simple', async () => {
      const program = succeed(42)
      const result = await runPromise(program)
      expect(result).toBe(42)
    })
    it('should work', async () => {
      const program = gen(function* () {
        const a = yield* succeed(42)
        const b = yield* promise(
          () =>
            new Promise<number>((resolve) =>
              setTimeout(() => resolve(10), 100),
            ),
        )
        return a + b
      })
      const result = await runPromise(program)
      expect(result).toBe(52)
    })
    it('should work with flatmap', async () => {
      const a = succeed(42)
      const b = map((v: number) => v + 10)
      const program = pipe(a, b)
      const result = await runPromise(program)
      expect(result).toBe(52)
    })
    it('should work with flatmap inside generator', async () => {
      const a = succeed(42)
      const b = flatMap((v: number) => succeed(v + 10))
      const program = gen(function* () {
        const result = yield* b(a)
        return result
      })
      const result = await runPromise(program)
      expect(result).toBe(52)
    })
    it('should work with multiple flatmap', async () => {
      const program = pipe(
        succeed(42),
        flatMap((v) => succeed(v + 1)),
        flatMap((v) => succeed(v + 1)),
        flatMap((v) => succeed(v + 1)),
        flatMap((v) => succeed(v + 1)),
        flatMap((v) => succeed(v + 1)),
      )
      const result = await runPromise(program)
      expect(result).toBe(47)
    })
  })
}
