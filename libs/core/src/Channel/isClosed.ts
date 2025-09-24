import { chan } from './chan'
import { Channel } from './index'

export type ClosedChannel<T> = Channel<T> & { closed: true }
export function isClosed<T>(channel: Channel<T>): channel is ClosedChannel<T> {
  return channel.closed
}

if (import.meta.vitest) {
  const { it, describe, expect, expectTypeOf } = import.meta.vitest

  describe('isClosed', () => {
    it('should return false for open channel', () => {
      const c = chan<number>()
      expect(isClosed(c)).toBe(false)
    })
    it('should return true for closed channel', () => {
      const c = Object.assign(chan<number>(), { closed: true })
      expect(isClosed(c)).toBe(true)
      if (isClosed(c)) {
        expectTypeOf(c).toEqualTypeOf<ClosedChannel<number>>()
      }
    })
  })
}
