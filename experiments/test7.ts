type A = [() => number, (v: number) => string, (v: string) => boolean]

type OutputOf<T extends [...UnaryFunc[]]> = T extends [infer F, ...infer R]
  ? F extends (...args: any) => any
    ? R extends [(...args: any) => any, ...((...args: any) => any)[]]
      ? OutputOf<R>
      : R extends []
        ? ReturnType<F>
        : never
    : never
  : never

type Test = OutputOf<A> // boolean

type UnaryFunc<T = any, R = any> = (v: T) => R
type AddToTuple<T extends UnaryFunc[], V extends Constraint<T>> = [...T, V]
type Constraint<T extends UnaryFunc[]> = (arg: OutputOf<T>) => any

if (import.meta.vitest) {
  const { it, expect, expectTypeOf } = import.meta.vitest

  it('should add to tuple', () => {
    const t1: [] = []
    const t2: [(v: number) => string] = [...t1, (v) => v.toString()]
    const t3: [(v: number) => string, (v: string) => boolean] = [
      ...t2,
      (v: string) => v.length > 0,
    ]
    const t4: [
      (v: number) => string,
      (v: string) => boolean,
      (v: boolean) => number,
    ] = [...t3, (v: boolean) => (v ? 1 : 0)]

    expectTypeOf<AddToTuple<[], (v: number) => string>>().toEqualTypeOf(t2)
    expectTypeOf<
      AddToTuple<[(v: number) => string], (v: string) => boolean>
    >().toEqualTypeOf(t3)
    expectTypeOf<
      AddToTuple<
        [(v: number) => string, (v: string) => boolean],
        (v: boolean) => number
      >
    >().toEqualTypeOf(t4)
  })
}
