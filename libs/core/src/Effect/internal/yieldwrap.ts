/**
 * Unique symbol used by the runtime/type bridging to access wrapped value.
 */
const YieldWrapTypeId = Symbol('YieldWrap')

/**
 * Type-level shape for a YieldWrap.
 */
export type YieldWrap<T> = {
  [YieldWrapTypeId]: () => T
}

export type YieldWrapType<T> = [T] extends [never]
  ? never
  : [T] extends [YieldWrap<infer U>]
    ? U
    : never

/**
 * yieldWrap: pure factory to create a YieldWrap object for value `v`.
 */
export const yieldWrap = <T>(v: T): YieldWrap<T> => {
  return {
    [YieldWrapTypeId]: () => v,
  } as YieldWrap<T>
}

export const isYieldWrap = <T>(value: unknown): value is YieldWrap<T> =>
  typeof value === 'object' && value !== null && YieldWrapTypeId in value

/**
 * yieldWrapGet: runtime helper to extract the inner value from a YieldWrap.
 */
export const yieldWrapGet = <T>(w: YieldWrap<T>): T => {
  if (typeof w === 'object' && w !== null && YieldWrapTypeId in w) {
    return w[YieldWrapTypeId]()
  }
  throw new Error('Not a YieldWrap')
}
