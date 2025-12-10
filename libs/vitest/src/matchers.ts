import type { MatchersObject, MatcherState } from '@vitest/expect'
import { matchers as EitherMatchers } from './either'
import { matchers as OptionMatchers } from './option'

export type * from './either'
export type * from './option'

export const matchers = <
  T extends MatcherState,
>(): MatchersObject<MatcherState> => ({
  ...EitherMatchers,
  ...OptionMatchers,
})
