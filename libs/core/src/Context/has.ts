import { Context } from './context'
import { Tag } from './requirement'

export const has = <T, Shape>(
  context: Context<unknown>,
  tag: Tag<T, Shape>,
): context is Context<T> => {
  return context.services.has(tag)
}
