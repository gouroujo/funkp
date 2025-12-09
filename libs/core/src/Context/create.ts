import { Context } from './context'

export const createEmptyContext = <R>(): Context<R> => {
  return {
    services: new Map(),
  }
}
