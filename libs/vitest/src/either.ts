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
  toEqualRight(received, expected) {
    const { isNot, equals } = this
    return {
      // do not alter your "pass" based on isNot. Vitest does it for you
      pass: received._tag === 'Right' && equals(received.right, expected),
      message: () => `${received} is${isNot ? ' not' : ''} Right`,
      actual: received,
      expected,
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
  toEqualLeft(received, expected) {
    const { isNot, equals } = this
    return {
      // do not alter your "pass" based on isNot. Vitest does it for you
      pass: received._tag === 'Left' && equals(received.left, expected),
      message: () => `${received} is${isNot ? ' not' : ''} ${expected}`,
      actual: received,
      expected,
    }
  },
}
export default matchers

export interface EitherMatchers<R = unknown> {
  toBeRight: () => void
  toEqualRight: (value: unknown) => void
  toBeLeft: () => void
  toEqualLeft: (value: unknown) => void
}

declare module 'vitest' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type, @typescript-eslint/no-empty-interface
  interface Matchers<T = any> extends EitherMatchers<T> {}
}
