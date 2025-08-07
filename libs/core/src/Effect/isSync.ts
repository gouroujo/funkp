import { Effect, SyncEffect } from '.'

export const isSync = <S, E, R>(
  effect: Effect<S, E, R>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): effect is SyncEffect<S, E, R> => !!(effect as any)?.[Symbol.iterator]
