import { expect } from 'vitest'
import type { EitherMatchers, OptionMatchers } from './matchers'
import matchers from './matchers'

expect.extend(matchers)

declare module 'vitest' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  interface Matchers<T = any> extends EitherMatchers<T>, OptionMatchers<T> {}
}
