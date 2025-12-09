import { None } from '.'

/**
 * The singleton None value.
 * @example
 * ```typescript
 * import { none } from './option'
 * const o = none()
 * // o is { _tag: 'None' }
 * ```
 */
export const none = (): None => ({
  _tag: 'None',
})
