/* eslint-disable @typescript-eslint/no-explicit-any */
import * as E from '../Either'
import * as Exit from '../Exit'
import { Runtime } from '../Runtime'
import * as Op from '../RuntimeOp'
import { fork } from './fork'
import { interrupt } from './interrupt'
import { runLoop } from './run'
import { RuntimeFiber } from './types'

type OperationHandlers<Op extends Op.Operation[]> = {
  [O in Op[number] as Op.OperationType<O>]: (
    op: O,
    handlers: {
      next: (nextValue?: any) => void
      fail: (error?: any) => void
      exit: (value?: any) => void
    },
    context: {
      runtime: Runtime<any>
      fiber: RuntimeFiber<any, any>
    },
  ) => void
}

export const handlers: OperationHandlers<[Op.Operation]> = {
  [Op.ASYNC_OP]: ({ value }, { next, fail }) => {
    value.then(next).catch(fail)
  },
  [Op.FAIL_OP]: ({ value }, { fail }) => fail(value),
  [Op.INJECT_OP]: (_, { next }) => setTimeout(() => next(), 0),
  [Op.PURE_OP]: ({ value }, { next }) => next(value),
  [Op.SLEEP_OP]: ({ value }, { next }) =>
    setTimeout(() => next(E.right(null)), value),
  [Op.SYNC_OP]: ({ value }, { next }) => next(value),
  [Op.WITH_RUNTIME_OP]: (_, { next }, { fiber }) => next(fiber),
  [Op.YIELD_OP]: (_, { next }) => setTimeout(() => next(), 0),
  [Op.INTERRUPT_OP]: (_, { exit }, { fiber }) => {
    interrupt(fiber)
      .then(() => {
        exit(Exit.interrupted(fiber))
      })
      .catch((err) => {
        exit(Exit.interruptFail(fiber, err))
      })
  },
  [Op.FORK_OP]: ({ value }, { next }, { fiber, runtime }) => {
    const child = fork(fiber, value)
    setImmediate(() => runLoop(child, runtime))
    next(child)
  },
}
