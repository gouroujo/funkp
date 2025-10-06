import { instruct, Instruct, InstructionHandler } from './types'

export const inject = instruct<'inject', string>('inject')
export type InjectInstruction = Instruct<typeof inject>

export const injectHandler: InstructionHandler<typeof inject> = (
  next,
  value,
  fiber,
) => {
  const serviceMap = fiber.context.services
  if (!serviceMap?.has(value)) {
    throw Error(`Missing dependency "${value}"`)
  }
  setImmediate(() => next(serviceMap.get(value)))
}
