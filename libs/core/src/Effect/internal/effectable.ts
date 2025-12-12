import * as Context from 'src/Context'
import type { Operation } from 'src/RuntimeOp'
import type { Effect } from '../effect'
import { singleShotGen } from './singleshotgen'
import { yieldWrap } from './yieldwrap'

export const effectable = <Success, Failure, Requirements>(
  ops: ((v?: any) => Operation<Success, Failure, Requirements>)[],
  context: Context.Context<Requirements> = Context.empty<Requirements>(),
): Effect<Success, Failure, Requirements> => {
  return {
    ops,
    context,
    [Symbol.iterator]() {
      return singleShotGen(yieldWrap(this))
    },
  }
}
