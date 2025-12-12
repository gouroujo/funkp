import { Context } from './context'

export const merge = <C1, C2>(
  c1: Context<C1>,
  c2: Context<C2>,
): Context<C1 | C2> => {
  return {
    ...c1,
    ...c2,
    services: new Map<C1 | C2, any>([
      ...c1.services.entries(),
      ...c2.services.entries(),
    ]),
  }
}
