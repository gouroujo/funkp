// Transducer primitives (inspired by Functional-Light JS appendix)

// Reducer: (accumulator, input) => accumulator
export type Reducer<Acc, In> = (acc: Acc, input: In) => Acc

// Transducer: transforms a reducer that accepts Out into a reducer that accepts In
export type Transducer<In, Out> = <Acc>(
  r: Reducer<Acc, Out>,
) => Reducer<Acc, In>

// map transducer
export const map = <In, Out>(
  mappingFn: (v: In) => Out,
): Transducer<In, Out> => {
  return <Acc>(reduce: Reducer<Acc, Out>) =>
    (accumulator: Acc, value: In) =>
      reduce(accumulator, mappingFn(value))
}

// filter transducer
export const filter = <T>(pred: (v: T) => boolean): Transducer<T, T> => {
  return <Acc>(r: Reducer<Acc, T>) =>
    (acc: Acc, v: T) =>
      pred(v) ? r(acc, v) : acc
}

// compose two transducers: compose(t1, t2)(r) = t1(t2(r))
export const compose = <A, B, C>(
  ab: Transducer<A, B>,
  bc: Transducer<B, C>,
): Transducer<A, C> => {
  return <Acc>(r: Reducer<Acc, C>) => ab(bc(r))
}

// generic transduce over any iterable
export function transduce<In, Out, Acc>(
  transducer: Transducer<In, Out>,
  combiner: Reducer<Acc, Out>,
  init: NoInfer<Acc>,
  iterable: Iterable<In>,
): Acc {
  const reducer = transducer(combiner)
  let acc = init
  for (const v of iterable) {
    acc = reducer(acc, v)
  }
  return acc
}

// helpers for common reducers
export function arrayPushReducer<T>(acc: T[], v: T): T[] {
  acc.push(v)
  return acc
}

export function stringConcatReducer(acc: string, v: string): string {
  return acc + v
}

if (import.meta.vitest) {
  const { describe, it, expect, expectTypeOf } = import.meta.vitest

  describe('transducer', () => {
    it('maps over string characters and concatenates', () => {
      const original = 'hello'
      const xf = map((c: string) => c.toUpperCase())
      const result = transduce<string, string, string>(
        xf,
        stringConcatReducer,
        '',
        original,
      )
      expect(result).toEqual('HELLO')
    })

    it('maps over array values', () => {
      const original = ['foo', 'bar']
      const xf = map((s: string) => s.toUpperCase())
      const asArray = transduce<string, string, string[]>(
        xf,
        arrayPushReducer,
        [],
        original,
      )
      expect(asArray).toEqual(['FOO', 'BAR'])
      const asString = transduce<string, string, string>(
        xf,
        stringConcatReducer,
        '',
        original,
      )
      expect(asString).toEqual('FOOBAR')
    })

    it('composes filter and map', () => {
      const original = ['a', 'ab', 'abc']
      const xf = compose(
        filter<string>((s) => s.length > 2),
        map((s) => s.toUpperCase()),
      )
      const asArray = transduce<string, string, string[]>(
        xf,
        arrayPushReducer,
        [],
        original,
      )
      expect(asArray).toEqual(['ABC'])
      const asString = transduce<string, string, string>(
        xf,
        stringConcatReducer,
        '',
        original,
      )
      expect(asString).toEqual('ABC')
    })
  })
}
