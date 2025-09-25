import { Effect } from '..'
import { Channel, ChannelFn, put, sleep } from '../../Channel'
import * as E from '../../Either'

export function delay<T>(value: T, ms: number): Effect<T, never, never> {
  return function* (channel: Channel): ChannelFn<typeof channel> {
    yield sleep(channel, ms)
    return yield put(channel, E.right(value))
  }
}
export function delayFail<E>(error: E, ms: number): Effect<never, E, never> {
  return function* (channel: Channel): ChannelFn<typeof channel> {
    yield sleep(channel, ms)
    return yield put(channel, E.left(error))
  }
}
