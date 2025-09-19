export const BrandTypeId: unique symbol = Symbol.for('funkp/Brand')

export interface Brand<in out ID extends string | symbol> {
  readonly [BrandTypeId]: {
    readonly [id in ID]: ID
  }
}

export function nominal<T>(): (arg: Omit<T, typeof BrandTypeId>) => T {
  return Object.assign((arg: Omit<T, typeof BrandTypeId>) => arg as T, {
    [BrandTypeId]: {} as any,
  })
}

if (import.meta.vitest) {
  const { it, expect, expectTypeOf } = import.meta.vitest

  it('should create a branded type', () => {
    type UserId = string & Brand<'UserId'>
    const UserId = nominal<UserId>()
    const userId = UserId('1234')
    expectTypeOf(userId).toEqualTypeOf<UserId>()
    expectTypeOf(userId).not.toEqualTypeOf<string>()
    expect(userId).toEqual('1234')
  })
}
