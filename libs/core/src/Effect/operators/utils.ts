import type { EffectFromEither } from '../types'

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
