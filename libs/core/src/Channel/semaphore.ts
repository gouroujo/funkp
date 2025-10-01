import { chan } from './chan'
import { put, take } from './operations'

export function semaphore(n: number): <T>(lambda: () => T) => Promise<T> {
  const c = chan<void>(n)
  return async <T>(lambda: () => T) => {
    await put()
    const r = await lambda()
    await take()
    return r
  }
}
