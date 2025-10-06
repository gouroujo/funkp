import type { Effect } from '../../Effect'
import { forkFiber } from '../fork'
import { instruct, Instruct, InstructionHandler } from './types'

export const fork = instruct<'fork', Effect<any, any, any>>('fork')
export type ForkInstruction = Instruct<typeof fork>

export const forkHandler: InstructionHandler<typeof fork> = (
  next,
  value,
  fiber,
) => {
  const child = forkFiber(value)(fiber)
  setImmediate(() => next(child))
}
