import { Either as E, pipe } from '../main'
import {
  Channel,
  ChannelFn,
  close,
  go,
  Instruction,
  put,
  take,
  wait,
  waitFor,
} from './test8'

export type Effect<Success, Failure = never, Requirements = never> = (
  channel: Channel<E.Either<Failure, Success>>,
) => Generator<
  Instruction<E.Either<Failure, Success>>,
  void,
  E.Either<Failure, any> | null
>

const succeed = <Success>(value: Success): Effect<Success, never, never> => {
  return function* (channel: Channel<E.Either<never, Success>>) {
    yield put(channel, E.right(value))
  }
}
const map = <Success, MappedSucces, Failure, Requirements>(
  fn: (value: Success) => MappedSucces,
): ((
  a: Effect<Success, Failure, Requirements>,
) => Effect<MappedSucces, Failure, Requirements>) => {
  return (e): Effect<any, Failure, Requirements> =>
    function* (channel: Channel<E.Either<Failure, any>>) {
      yield* e(channel)
      const value = yield take(channel)
      if (value) yield put(channel, E.mapRight(fn)(value))
    }
}

const promise = <Success, Failure, Requirements>(
  fn: () => Promise<Success>,
): Effect<Success, Failure, Requirements> => {
  return function* (
    channel: Channel<E.Either<Failure, Success>>,
  ): ChannelFn<typeof channel> {
    yield waitFor(channel, fn().then(E.right).catch(E.left))
    const value = yield take(channel)
    if (value) yield put(channel, value)
  }
}

type Fiber<Success, Failure> = {
  channel: Channel<E.Either<Failure, Success>>
  effect: Effect<Success, Failure, never>
}
function createFiber<Success, Failure>(
  effect: Effect<Success, Failure, never>,
): Fiber<Success, Failure> {
  const channel: Channel<E.Either<Failure, any>> = {
    closed: false,
    buffer: [],
  }
  return {
    channel,
    effect,
  }
}
function runFiber<Success, Failure>(fiber: Fiber<Success, Failure>) {
  go(
    function* (channel): ChannelFn<Channel<E.Either<Failure, any>>> {
      yield* fiber.effect(channel)
      const value = yield take(fiber.channel)
      if (value !== null) {
        close(fiber.channel, value)
      }
    },
    [fiber.channel],
  )
}
function runPromise<Success, Failure>(
  effect: Effect<Success, Failure, never>,
): Promise<E.Either<Failure, Success>> {
  const fiber = createFiber(effect)
  runFiber(fiber)
  return wait(fiber.channel)
}

if (import.meta.vitest) {
  const { it, describe, expect } = import.meta.vitest
  describe('test poc', () => {
    it('should work with CSP', async () => {
      const effect = succeed(42)
      const result = await runPromise(effect)
      expect(result).toEqual({ _tag: 'Right', right: 42 })
    })
    it('should work with async CSP', async () => {
      const effect = promise(() => Promise.resolve(42))
      const result = await runPromise(effect)
      expect(result).toEqual({ _tag: 'Right', right: 42 })
    })
    it('should work with pipe', async () => {
      const effect = pipe(
        succeed(42),
        map((value) => value + 1),
        map((value) => value + 2),
      )
      const result = await runPromise(effect)
      expect(result).toEqual({ _tag: 'Right', right: 45 })
    })
    it('should work with an async pipe', async () => {
      const effect = pipe(
        promise(() => Promise.resolve(42)),
        map((value) => value + 1),
        map((value) => value + 2),
      )
      const result = await runPromise(effect)
      expect(result).toEqual({ _tag: 'Right', right: 45 })
    })
  })
}
