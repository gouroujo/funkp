import { instruct, Instruct, InstructionHandler } from './types'

export const interrupt = instruct<'interrupt', number>('interrupt')
export type InterruptInstruction = Instruct<typeof interrupt>

export const interruptHandler: InstructionHandler<typeof interrupt> = (
  next,
  value,
) => {
  setTimeout(() => next(), value)
}
