import { Fiber } from './fiber'

export function close() {
  return (fiber: Fiber<any, any>) => {
    fiber.status = 'closed'
  }
}
