import { MatchersObject } from '@vitest/expect'
import 'vitest'

const matchers: MatchersObject = {
  toBeRight(received) {
    const { isNot } = this
    return {
      // do not alter your "pass" based on isNot. Vitest does it for you
      pass: received._tag === 'Right',
      message: () => `${received} is${isNot ? ' not' : ''} Right`,
    }
  },
  toBeRightWith(received, expected) {
    const { isNot } = this
    return {
      // do not alter your "pass" based on isNot. Vitest does it for you
      pass: received._tag === 'Right' && received.right === expected,
      message: () => `${received} is${isNot ? ' not' : ''} ${expected}`,
    }
  },
  toBeLeft(received) {
    const { isNot } = this
    return {
      // do not alter your "pass" based on isNot. Vitest does it for you
      pass: received._tag === 'Left',
      message: () => `${received} is${isNot ? ' not' : ''} Left`,
    }
  },
  toBeLeftWith(received, expected) {
    const { isNot } = this
    return {
      // do not alter your "pass" based on isNot. Vitest does it for you
      pass: received._tag === 'Left' && received.left === expected,
      message: () => `${received} is${isNot ? ' not' : ''} ${expected}`,
    }
  },
}
export default matchers

export interface EitherMatchers<R = unknown> {
  toBeRight: () => void
  toBeRightWith: (value: unknown) => void
  toBeLeft: () => void
  toBeLeftWith: (value: unknown) => void
}

declare module 'vitest' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type, @typescript-eslint/no-empty-interface
  interface Matchers<T = any> extends EitherMatchers<T> {}
}
