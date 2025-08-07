import { Effect } from '.'
import { gen } from './gen'
import { run } from './run'

export function promise<Success>(
  promiseFn: () => Promise<Success>,
): Effect<Success, never, never> {
  // eslint-disable-next-line require-yield
  return gen(async function* () {
    const result = await promiseFn()
    return result
  })
}

if (import.meta.vitest) {
  const { describe, it, expect, expectTypeOf } = import.meta.vitest

  describe('Promise constructor', () =>
    it('should handle async failure', async () => {
      const effect = promise(() => Promise.resolve('async result' as const))
      expectTypeOf(effect).toEqualTypeOf<Effect<'async result', never, never>>()
      const result = await run(effect)
      expect(result).toEqual({ _tag: 'Right', right: 'async result' })
    }))
}
