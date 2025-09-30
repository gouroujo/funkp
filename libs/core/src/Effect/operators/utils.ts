import { Effect } from '..'
import type { Either } from '../../Either'

export type EffectFromEither<E extends Either<any, any>> =
  E extends Either<infer L, infer R> ? Effect<R, L, never> : never

export const elevate = <F extends () => any>(operator: F) => {
  return (...args: Parameters<F>) => {
    return (effect: EffectFromEither<any>) => ({
      *[Symbol.iterator]() {
        const value = yield* effect
        return operator.apply(effect, args)(value)
      },
    })
  }
}
