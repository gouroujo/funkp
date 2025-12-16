import { isObjectWithKeyValue } from 'src/utils'
import { Effect } from './effect'

export function isEffect(
  effect: unknown,
): effect is Effect<unknown, unknown, unknown>
export function isEffect<A, E, R>(
  effect: Effect<A, E, R>,
): effect is Effect<A, E, R>
export function isEffect(effect: unknown): boolean {
  return isObjectWithKeyValue(effect, '_tag', 'effect')
}
