export type PureInstruction<T = unknown> = {
  _action: 'pure'
  value: T
}
export const pure = <T>(value: T) => ({
  *[Symbol.iterator](): Generator<PureInstruction<T>, T, T> {
    return yield { _action: 'pure', value }
  },
})
