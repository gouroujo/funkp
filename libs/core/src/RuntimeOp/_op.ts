export interface Operation<T = unknown> {
  _op: Readonly<string | symbol>
  value?: T
}
