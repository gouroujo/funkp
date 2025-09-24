import type { Brand } from '../Brand'
import type { Channel } from '../Channel'
import type { Effect } from '../Effect'
import type * as E from '../Either'

export type FiberId = string & Brand<'FiberId'>

export interface Fiber<Success, Failure> {
  id: FiberId
  parentId?: FiberId
  childs: Fiber<any, any>[]
  channel: Channel<E.Either<Failure, Success>>
  effect: Effect<Success, Failure, never>
}
