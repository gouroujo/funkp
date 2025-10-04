import type { Brand } from '../Brand'
import type { Context } from '../Context'
import type { Effect } from '../Effect'
import type * as E from '../Either'

export type FiberId = string & Brand<'FiberId'>
export type FiberStatus = 'running' | 'suspended' | 'closed'
export interface Fiber<Success, Failure> {
  id: FiberId
  parent?: Fiber<unknown, unknown>
  childs: Fiber<any, any>[]
  effect: Effect<Success, Failure, never>
  listeners: Array<
    [
      resolve: (result: E.Either<Failure, Success>) => void,
      reject: (reason: string) => void,
    ]
  >
  status: FiberStatus
  context: Context
}
