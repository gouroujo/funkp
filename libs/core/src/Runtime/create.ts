import { Runtime } from '.'

export const create = <R>(context?: any): Runtime<R> => {
  return {
    context: context ?? {},
    fiberRefs: [],
    flags: {
      cooperativeYielding: true,
    },
  }
}

export const defaultRuntime = create<never>()
