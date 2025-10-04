import { left, right } from '../../Either'
import { suspend } from '../../Fiber/instructions'
import type { Effect } from '../types'

const _fetch = (
  ...args: Parameters<typeof fetch>
): Effect<Response, unknown, never> => {
  return {
    *[Symbol.iterator]() {
      return yield* suspend(
        fetch(...args)
          .then(right)
          .catch(left),
      )
    },
  }
}

export default { fetch: _fetch }
