import { Effect } from '..'
import { Channel, put, sleep } from '../../Channel'
import * as E from '../../Either'

export function delay<T>(value: T, ms: number): Effect<T, never, never> {
  return function* (channel: Channel<E.Either<never, T>>) {
    yield sleep(channel, ms)
    yield put(channel, E.right(value))
  }
}
export function delayFail<E>(error: E, ms: number): Effect<never, E, never> {
  return function* (channel: Channel<E.Either<E, never>>) {
    yield sleep(channel, ms)
    yield put(channel, E.left(error))
  }
}
