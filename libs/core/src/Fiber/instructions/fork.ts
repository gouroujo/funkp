import { Effect } from '../../Effect'
import { Fiber } from '../fiber'

export type ForkInstruction<Success = unknown, Failure = unknown> = {
  _action: 'fork'
  value: Effect<Success, Failure, never>
}

export const fork = <Success, Failure>(
  value: Effect<Success, Failure, never>,
) => ({
  *[Symbol.iterator](): Generator<
    ForkInstruction<Success, Failure>,
    Fiber<Success, Failure>,
    Fiber<Success, Failure>
  > {
    return yield { _action: 'fork', value }
  },
})
