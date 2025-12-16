import { expect } from 'vitest'
import { Context } from './context'
import { clone } from './empty'
import { Tag } from './requirement'

export const add =
  <T, Shape>(tag: Tag<T, Shape>, service: Shape) =>
  <Services>(context: Context<Services>): Context<Services | T> => {
    const newContext = clone<Services | T>(context)
    newContext.services.set(tag as T, service)
    return newContext
  }

if (import.meta.vitest) {
  const { describe, it, expectTypeOf } = import.meta.vitest
  const Context = await import('src/Context')

  class ServiceTest extends Context.Service('MyService')<
    ServiceTest,
    { test: string }
  >() {}

  describe('Context.add', () => {
    it('should add a service to the context', () => {
      const emptyContext = Context.empty()
      const addService = Context.add(ServiceTest, { test: 'aaa' })
      const context = addService(emptyContext)
      expectTypeOf(context).toEqualTypeOf<Context<ServiceTest>>()
      expect(Context.has(context, ServiceTest)).toBe(true)
    })
  })
}
