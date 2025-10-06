import { instruct, Instruct, InstructionHandler } from './types'

export const sleep = instruct<'sleep', number>('sleep')
export type SleepInstruction = Instruct<typeof sleep>

export const sleepHandler: InstructionHandler<typeof sleep> = (next, value) => {
  setTimeout(() => next(), value)
}
