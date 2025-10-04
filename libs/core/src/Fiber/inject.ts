import { Fiber } from './fiber'
import { inject, InjectInstruction } from './instructions'

export const INJECT_FIBER = '__INJECT_FIBER__'
export const injectFiber = () => ({
  *[Symbol.iterator](): Generator<
    InjectInstruction,
    Fiber<any, any>,
    Fiber<any, any>
  > {
    return yield inject(INJECT_FIBER)
  },
})
