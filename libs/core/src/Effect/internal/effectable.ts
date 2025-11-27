import type { Operation } from 'src/RuntimeOp'
import type { Effect } from '../effect'
import { singleShotGen } from './singleshotgen'
import { yieldWrap } from './yieldwrap'

export const effectable = <Success, Failure, Context>(
  ops: ((v?: any) => Operation<any, any, any>)[],
): Effect<Success, Failure, Context> => {
  return {
    ops,
    [Symbol.iterator]() {
      return singleShotGen(yieldWrap(this))
    },
  }
}
