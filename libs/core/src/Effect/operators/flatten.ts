import { Effect } from '..'

export function flatten<S, F1, R1, F2, R2>() {
  return (
    effect: Effect<Effect<S, F1, R1>, F2, R2>,
  ): Effect<S, F1 | F2, R1 | R2> => ({
    _tag: 'Flat',
    effect,
    *[Symbol.iterator]() {
      return yield this
    },
  })
}
