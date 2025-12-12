import { Context } from './context'

export const empty = <R = never>(): Context<R> => {
  return {
    services: new Map(),
  }
}

export const clone = <R = never>(context: Context<R>): Context<R> => {
  return {
    ...context,
    services: new Map(context.services.entries()),
  }
}
