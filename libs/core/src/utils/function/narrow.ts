// source from https://github.com/millsp/ts-toolbelt/sources/Function/Narrow.ts
export type Narrowable = string | number | bigint | boolean

export type Cast<A1, A2> = A1 extends A2 ? A1 : A2

type _Narrow<A> =
  | []
  | (A extends Narrowable ? A : never)
  | { [K in keyof A]: _Narrow<A[K]> }

export type Narrow<A> = Cast<A, _Narrow<A>> | A

if (import.meta.vitest) {
  const { describe, it, expectTypeOf } = import.meta.vitest
  describe('Narrow type', () => {
    it('should narrow string', () => {
      const identity = <A extends string>(x: Narrow<A>): A => x as any
      expectTypeOf(identity('foo')).toEqualTypeOf<'foo'>()
    })
  })
}
