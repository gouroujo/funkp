import { Operation } from './_op'

export const YIELD_OP = Symbol('YIELD_OP')
export const coopYield = (): CooperativeYieldingOperation => ({
  _op: YIELD_OP,
})
export interface CooperativeYieldingOperation extends Operation {
  _op: typeof YIELD_OP
}
