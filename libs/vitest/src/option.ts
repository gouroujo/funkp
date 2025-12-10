import type { MatchersObject } from '@vitest/expect'
import 'vitest'

const isSome = (o: any) => o._tag === 'Some'
const isNone = (o: any) => o._tag === 'None'

export const matchers: MatchersObject = {
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

export interface OptionMatchers<R = unknown> {
  toBeSome: () => R
  toBeNone: () => R
  toEqualSome: (value: unknown) => R
}

declare module 'vitest' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type, @typescript-eslint/no-empty-interface
  interface Matchers<T = any> extends OptionMatchers<T> {}
}
