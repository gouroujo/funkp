import { UnaryFunction } from '.'

export type TupleRestKey<T extends unknown[]> = {
  [k in keyof T]: k extends keyof T ? (number extends k ? number : never) : k
}[number]
export type TupleRest<T extends unknown[]> = T[TupleRestKey<T>]
export type Tail<T extends unknown[]> = T extends [unknown, ...infer TT]
  ? TT
  : []
export type Last<T extends unknown[]> = T[number extends T['length']
  ? TupleRestKey<T> | TupleRestKey<Tail<T>>
  : Tail<T>['length']]

type MappedArgs<
  P,
  Fns extends UnaryFunction[],
  Prev extends UnaryFunction[] = [never, ...Fns],
> = {
  [I in keyof Fns]: Fns[I] extends UnaryFunction
    ? I extends '0'
      ? (arg: P) => ReturnType<Fns[I]>
      : (
          arg: I extends keyof Prev ? ReturnType<Prev[I]> : unknown,
        ) => ReturnType<Fns[I]>
    : Fns[I]
}

export const pipe = <P, Fns extends [UnaryFunction, ...UnaryFunction[]]>(
  arg: P,
  ...fns: MappedArgs<P, Fns> extends Fns ? Fns : MappedArgs<P, Fns>
): ReturnType<Last<Fns>> => {
  return fns.reduce((acc, fn) => fn(acc), arg) as ReturnType<Last<Fns>>
}

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest

  it('should apply functions in sequence', () => {
    const result = pipe(
      'hello',
      (s) => s.length,
      (n) => n * 2,
      (n) => n.toString(),
    )
    expect(result).toBe('10')
  })
}
