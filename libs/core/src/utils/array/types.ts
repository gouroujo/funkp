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
