export type AsyncInstruction<T> = {
  _tag: 'async'
  promise: Promise<T>
}

export const async = <T>(promise: Promise<T>): AsyncInstruction<T> => {
  return { _tag: 'async', promise }
}
