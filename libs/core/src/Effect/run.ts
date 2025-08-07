import { Effect, SyncEffect } from '.'
import { Either, isLeft, right } from '../Either'
import { isSync } from './isSync'
import { succeed } from './succeed'

export function run<Success, Failure>(
  effect: SyncEffect<Success, Failure, never>,
): Either<Failure, Success>
export function run<Success, Failure>(
  effect: Effect<Success, Failure, never>,
): Promise<Either<Failure, Success>>
export function run<Success, Failure>(
  effect: SyncEffect<Success, Failure, never> | Effect<Success, Failure, never>,
): Either<Failure, Success> | Promise<Either<Failure, Success>> {
  return isSync(effect) ? runSync(effect) : runAsync(effect)
}

function runSync<Success, Failure>(
  effect: SyncEffect<Success, Failure, never>,
): Either<Failure, Success> {
  const iterator = effect[Symbol.iterator]()
  return (() => {
    let result = iterator.next()
    while (!result.done) {
      if (isLeft(result.value)) {
        return result.value
      }
      result = iterator.next()
    }
    return right(result.value)
  })()
}

function runAsync<Success, Failure>(
  effect: Effect<Success, Failure, never>,
): Promise<Either<Failure, Success>> {
  const iterator = effect[Symbol.asyncIterator]()
  return (async () => {
    let result = await iterator.next()
    while (!result.done) {
      if (isLeft(result.value)) {
        return result.value
      }
      result = await iterator.next()
    }
    return right(result.value)
  })()
}

if (import.meta.vitest) {
  const { describe, it, expect } = import.meta.vitest
  describe('run a synchronous Effect', () => {
    it('runs a synchronous Effect and returns its result', () => {
      const effect = succeed(123)
      expect(run(effect)).toEqual({
        _tag: 'Right',
        right: 123,
      })
    })
  })
}
