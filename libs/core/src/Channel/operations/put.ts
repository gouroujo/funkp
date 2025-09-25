export type PutInstruction<T = unknown> = {
  _tag: 'put'
  value: T
}

export const put = <T>(value: T): PutInstruction<T> => {
  return { _tag: 'put', value }
}
