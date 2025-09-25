export type NoExcessProperties<T, U> = T & {
  readonly [K in Exclude<keyof U, keyof T>]: never
}
export type StrictObject<T> = NoExcessProperties<T, T>
export type ValueOf<T extends Record<any, any>> =
  T extends Record<any, infer K> ? K : never
