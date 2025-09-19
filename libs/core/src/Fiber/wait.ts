import { isLeft } from '../Either'
import { Fiber } from './fiber'

export function wait() {
  return <Success, Failure>(fiber: Fiber<Success, Failure>) => {
    return new Promise((resolve, reject) => {
      fiber.listeners.push((result) => {
        if (isLeft(result)) reject(result.left)
        else resolve(result.right)
      })
    })
  }
}
