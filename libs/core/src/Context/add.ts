import { expect } from 'vitest'
import { Context } from './context'
import { clone } from './empty'
import { ServiceClass } from './requirement'

export const add =
  <T, Shape>(tag: ServiceClass<T, Shape>, service: Shape) =>
  <Services>(context: Context<Services>): Context<Services | T> => {
    const newContext = clone<Services | T>(context)
    newContext.services.set(tag.id as T, service)
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
      const context = Context.empty()
      const addService = Context.add(ServiceTest, { test: 'aaa' })
      const result = addService(context)
      expectTypeOf(result).toEqualTypeOf<Context<ServiceTest>>()
      expect(Context.has(result, ServiceTest)).toBe(true)
    })
  })
}
