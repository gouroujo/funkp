import { YieldWrap } from './yieldwrap'

export const singleShotGen = <T, R = any>(
  wrapped: YieldWrap<T>,
): Iterator<YieldWrap<T>, R, T> => {
  let hasYielded = false
  return {
    next(arg?: T) {
      if (!hasYielded) {
        hasYielded = true
        return { value: wrapped, done: false } as IteratorResult<
          YieldWrap<T>,
          R
        >
      } else {
        return { value: arg as unknown as R, done: true } as IteratorResult<
          YieldWrap<T>,
          R
        >
      }
    },
    throw(err: unknown): IteratorResult<YieldWrap<T>, R> {
      throw err
    },
    return(value?: R) {
      return { value: value as R, done: true }
    },
  }
}
