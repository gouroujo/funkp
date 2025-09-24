import { absurd } from '../functions'

export type Channel<T> = {
  takers?: Array<(value: T) => void>
  buffer: Array<T>
  listeners?: Array<(result: T) => void>
  closed: boolean
}

export type ChannelFn<C extends Channel<any>> =
  C extends Channel<infer T> ? Generator<Instruction<T>, void, T | null> : never

type TakeInstruction<T = unknown> = {
  _tag: 'take'
  channel: Channel<T>
}

type PutInstruction<T = unknown> = {
  _tag: 'put'
  channel: Channel<T>
  value: T
}

type SleepInstruction<T> = {
  _tag: 'sleep'
  channel: Channel<T>
  ms: number
}

type WaitInstruction<T> = {
  _tag: 'wait'
  channel: Channel<T>
  promise: Promise<T>
}

export type Instruction<T> =
  | TakeInstruction<T>
  | PutInstruction<T>
  | SleepInstruction<T>
  | WaitInstruction<T>

export const take = <T>(channel: Channel<T>): TakeInstruction<T> => {
  return { _tag: 'take' as const, channel }
}
const takeHandler = <T>(channel: Channel<T>, cb: (value: T | null) => void) => {
  if (channel.closed) return cb(null)
  if (channel.buffer.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const value = channel.buffer.pop()!
    cb(value)
  } else {
    channel.takers = [...(channel.takers ?? []), cb]
  }
}

export const put = <T>(channel: Channel<T>, value: T): PutInstruction<T> => {
  return { _tag: 'put' as const, channel, value }
}
const putHandler = <T>(
  channel: Channel<T>,
  value: T,
  cb: (value: T | null) => void,
) => {
  if (channel.closed) return cb(null)
  if (channel.takers && channel.takers.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const taker = channel.takers.shift()!
    cb(value)
    taker(value)
  } else {
    channel.buffer.unshift(value)
    cb(value)
  }
}

export const sleep = <T>(
  channel: Channel<T>,
  ms: number,
): SleepInstruction<T> => {
  return { _tag: 'sleep' as const, channel, ms }
}
const sleepHandler = <T>(channel: Channel<T>, ms: number, cb: () => void) => {
  if (channel.closed) return cb()
  setTimeout(() => {
    cb()
  }, ms)
}

export const waitFor = <T>(
  channel: Channel<T>,
  promise: Promise<T>,
): WaitInstruction<T> => {
  return { _tag: 'wait' as const, channel, promise }
}
const waitHandler = <T>(
  channel: Channel<T>,
  promise: Promise<T>,
  cb: () => void,
) => {
  promise.then((value) => {
    if (channel.closed) return cb()
    if (channel.takers && channel.takers.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const taker = channel.takers.shift()!
      cb()
      setImmediate(() => taker(value))
    } else {
      channel.buffer.push(value)
      cb()
    }
  })
}

export const close = <T>(channel: Channel<T>, value?: T) => {
  if (value !== undefined && channel.listeners) {
    channel.listeners.forEach((cb) => cb(value))
  }
  return Object.assign(channel, { closed: true })
}

export const wait = <T>(channel: Channel<T>) => {
  return new Promise<T>((resolve) => {
    channel.listeners = [...(channel.listeners ?? []), resolve]
  })
}

const go_ = <T>(
  generator: Generator<Instruction<T>, unknown, T | null>,
  state?: T | null,
) => {
  const step = state ? generator.next(state) : generator.next()
  if (!step.done) {
    const instruction = step.value
    switch (instruction._tag) {
      case 'take': {
        const { channel } = instruction
        takeHandler(channel, (value) =>
          setImmediate(() => go_(generator, value)),
        )
        break
      }
      case 'put': {
        const { channel, value } = instruction
        putHandler(channel, value, (value) =>
          setImmediate(() => go_(generator, value)),
        )
        break
      }
      case 'wait': {
        const { channel, promise } = instruction
        waitHandler(channel, promise, () => setImmediate(() => go_(generator)))
        break
      }
      case 'sleep': {
        const { channel, ms } = instruction
        sleepHandler(channel, ms, () => setImmediate(() => go_(generator)))
        break
      }
      default: {
        absurd(instruction)
      }
    }
  }
}

export const go = <T, A extends unknown[] = never[]>(
  genFn: (...args: A) => Generator<Instruction<T>, unknown, T | null>,
  args: A,
) => {
  go_(genFn(...args))
}

if (import.meta.vitest) {
  const { it, describe, expect } = import.meta.vitest

  type Ball = {
    hits: number
  }

  const player = function* (
    table: Channel<Ball>,
    name: string,
  ): Generator<Instruction<Ball>, void, Ball | null> {
    while (true) {
      const ball = yield take(table)
      if (ball === null) {
        console.log(name + ": table's gone")
        break
      }
      ball.hits += 1
      console.log(`${name} ${ball.hits}`)
      yield put(table, ball)
    }
  }

  describe('gene', () => {
    it('should work', async () => {
      const table: Channel<Ball> = { closed: false, buffer: [] }
      go(function* (): Generator<Instruction<Ball>, void, Ball | null> {
        yield put(table, { hits: 0 })
        go(player, [table, 'ping'])
        go(player, [table, 'pong'])
        console.log('game started')
        yield sleep(table, 10)
        const ball = yield take(table)
        if (ball) {
          console.log('game finished')
          close(table, ball)
        }
      }, [])

      const result = await wait(table)
      expect(result.hits).toBeGreaterThan(10)
    })
  })
}
