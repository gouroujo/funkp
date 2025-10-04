export type SuspendInstruction<T = unknown> = {
  _action: 'wait'
  value: Promise<T>
}

export const suspend = <T>(promise: Promise<T>) => ({
  *[Symbol.iterator](): Generator<SuspendInstruction<T>, T, T> {
    return yield {
      _action: 'wait',
      value: promise,
    }
  },
})
