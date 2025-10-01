import { Effect } from '..'
import { put, sleep } from '../../Channel'
import * as E from '../../Either'

export function delay<T>(value: T, ms: number): Effect<T, never, never> {
  return {
    *[Symbol.iterator]() {
      yield sleep(ms)
      return yield put(E.right(value))
    },
  }
}
export function delayFail<E>(error: E, ms: number): Effect<never, E, never> {
  return {
    *[Symbol.iterator]() {
      yield sleep(ms)
      return yield put(E.left(error))
    },
  }
}
