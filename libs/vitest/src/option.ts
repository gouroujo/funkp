import { MatchersObject } from '@vitest/expect'
import 'vitest'
// eslint-disable-next-line @nx/enforce-module-boundaries
import { isNone, isSome } from '@funkp/core/Option'

const matchers: MatchersObject = {
  toBeSome(received) {
    const { isNot } = this
    return {
      // do not alter your "pass" based on isNot. Vitest does it for you
      pass: isSome(received),
      message: () => `${received} is${isNot ? ' not' : ''} Some`,
    }
  },
  toBeNone(received) {
    const { isNot } = this
    return {
      // do not alter your "pass" based on isNot. Vitest does it for you
      pass: isNone(received),
      message: () => `${received} is${isNot ? ' not' : ''} None`,
    }
  },
  toEqualSome(received, expected) {
    const { isNot, equals } = this
    return {
      // do not alter your "pass" based on isNot. Vitest does it for you
      pass: isSome(received) && equals(received.value, expected),
      message: () => `${received} is${isNot ? ' not' : ''} Some`,
      actual: received,
      expected,
    }
  },
}
export default matchers

export interface OptionMatchers<R = unknown> {
  toBeSome: () => void
  toBeNone: () => void
  toEqualSome: (value: unknown) => void
}

declare module 'vitest' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type, @typescript-eslint/no-empty-interface
  interface Matchers<T = any> extends OptionMatchers<T> {}
}
