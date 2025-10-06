import { instruct, Instruct, InstructionHandler } from './types'

export const pure = instruct<'pure', any>('pure')
export type PureInstruction = Instruct<typeof pure>

export const pureHandler: InstructionHandler<typeof pure> = (next, value) => {
  setImmediate(() => next(value))
}
