import { instruct, Instruct, InstructionHandler } from './types'

export const wait = instruct<'wait', Promise<any>>('wait')
export type WaitInstruction = Instruct<typeof wait>

export const waitHandler: InstructionHandler<typeof wait> = (next, value) => {
  value.then((res) => setImmediate(() => next(res)))
}
