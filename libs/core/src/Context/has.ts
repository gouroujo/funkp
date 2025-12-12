import { Context } from './context'
import { ServiceClass } from './requirement'

export const has = <T, Shape>(
  context: Context<unknown>,
  tag: ServiceClass<T, Shape>,
): context is Context<T> => {
  return context.services.has(tag.id)
}
