import { Context, createEmptyContext } from 'src/Context'
import { Runtime } from '.'

export const create = <R>(context?: Context<R>): Runtime<R> => {
  return {
    context: context ?? createEmptyContext(),
    fiberRefs: [],
    flags: {
      cooperativeYielding: true,
    },
  }
}

export const defaultRuntime = create<never>()
