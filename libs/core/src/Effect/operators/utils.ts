import { Effect } from '..'
import type { Either } from '../../Either'
import * as eitherOperators from '../../Either/operators'

export type EffectFromEither<E extends Either<any, any>> =
  E extends Either<infer L, infer R> ? Effect<R, L, never> : never

export const elevate = <
  F extends (typeof eitherOperators)[Exclude<
    keyof typeof eitherOperators,
    'flatten'
  >],
>(
  operator: F,
) => {
  return (...args: Parameters<F>) => {
    return (effect: EffectFromEither<Parameters<ReturnType<F>>[0]>) => ({
      *[Symbol.iterator]() {
        const value = yield* effect
        return operator.apply(effect, args)(value)
      },
    })
  }
}
