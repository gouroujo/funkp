import { Operation } from './_op'

export const YIELD_OP = 'YIELD_OP' as const
export const coopYield = (): CooperativeYieldingOperation => ({
  _op: YIELD_OP,
})
export interface CooperativeYieldingOperation extends Operation {
  _op: typeof YIELD_OP
}
