import { Either, right } from 'src/Either'

interface Instruction {
  type: string
}

interface MapInstruction<I = any, O = any> extends Instruction {
  type: 'map'
  mapFn: (input: I) => O
}

interface TapInstruction<I = any> extends Instruction {
  type: 'tap'
  tapFn: (input: I) => void
}
type EffectInstruction = MapInstruction | TapInstruction

type Effect<Success, Failure = never, Requirements = never> = {
  instructions: EffectInstruction[]
  [Symbol.asyncIterator]: () => AsyncGenerator<
    Instruction | Requirements,
    Success,
    any
  >
}

const map =
  <I, O>(mapFn: (input: I) => O) =>
  (effect: Effect<I>): Effect<O> => {
    return gen(async function* () {
      const input = yield* effect
      const output = yield { type: 'map', mapFn } as MapInstruction<I, O>
      return output
    })
  }

const go_ = <T, TReturn>(generator: Generator<Instruction, TReturn, T>, state?: T) => {
  const step = state ? generator.next(state) : generator.next()
  if (!step.done) {
    const instruction = step.value
    if (instruction.type === 'map') {
      const { mapFn } = instruction as MapInstruction
      return go_(generator, mapFn(state))
    } else if (instruction.type === 'tap') {
      const { tapFn } = instruction as TapInstruction
      tapFn(state)
      return go_(generator, state)
    }
  }
  return step.value as TReturn
}

const runPromise = <S, E>(
  effect: Effect<S, E, never>,
): Promise<Either<E, S>> => {}

export function gen<TReturn>(
  fn: () => AsyncGenerator<Instruction, TReturn, any>,
): Effect<TReturn, never, never> {
  return {
    instructions: [],
    async *[Symbol.asyncIterator]() {
      const iterator = fn()
      let result = await iterator.next()
      while (!result.done) {
        const instruction = result.value
        const response = yield instruction
        result = await iterator.next(response)
      }
      return result.value
    },
  }
}

if (import.meta.vitest) {
  const { it, describe, expect } = import.meta.vitest

  it('should work', async () => {
    // eslint-disable-next-line require-yield
    const effect = gen(function* () {
      return 'Hello'
    })
    const mapping = map((s: string) => s + ' world!')
    const mapped = mapping(effect)
    const result = await runPromise(mapped)
    expect(result).toEqual(right('Hello world!'))
  })
}
