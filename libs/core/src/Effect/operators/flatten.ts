import type { Effect } from '..'
import { isRight } from '../../Either'

export function flatten<S, F1, R1, F2, R2>() {
  return (
    effect: Effect<Effect<S, F1, R1>, F2, R2>,
  ): Effect<S, F1 | F2, R1 | R2> => ({
    *[Symbol.iterator]() {
      const value = yield* effect
      return isRight(value) ? yield* value.right : value
    },
  })
}
