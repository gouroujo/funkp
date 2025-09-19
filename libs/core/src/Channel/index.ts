/* eslint-disable @typescript-eslint/no-explicit-any */
import { absurd } from 'src/functions'
import { expect } from 'vitest'

export const PARK = 'park'
export const CONTINUE = 'continue'
export const END = 'end'
type Action = typeof PARK | typeof CONTINUE | typeof END

export type Channel<T> = {
  buffer: T[]
  closed: boolean
  takers?: Array<(value: T) => void>
  putters?: Array<{ value: T; cb?: (value: T) => void }>
}

export function chan<T>(): Channel<T> {
  return {
    buffer: [],
    closed: false,
  }
}
export function isClosed<T>(channel: Channel<T>): boolean {
  return channel.closed
}
export function isEmpty<T>(channel: Channel<T>): boolean {
  return channel.buffer.length === 0
}
export function close<T>(channel: Channel<T>): Channel<T> {
  return {
    ...channel,
    closed: true,
  }
}

export function timeout(msecs: number): Channel<never> {
  const ch: Channel<never> = chan()
  setTimeout(() => close(ch), msecs)
  return ch
}

export function put<T>(
  channel: Channel<T>,
  value: T,
  cb?: (value: T) => void,
): () => [Action, null] {
  return function () {
    if (isEmpty(channel)) {
      channel.buffer.unshift(value)
      if (cb) cb(value)
      return [CONTINUE, null]
    } else {
      return [PARK, null]
    }
  }
}

export function take<T>(
  channel: Channel<T>,
  cb?: (value: T) => void,
): () => [Action, T | null] {
  return function () {
    if (isEmpty(channel)) {
      return [PARK, null]
    } else {
      const value = channel.buffer.pop() as T
      if (cb) cb(value)
      return [CONTINUE, value]
    }
  }
}

function go_<T, R>(
  machine: Generator<() => [Action, T], R>,
  step: IteratorResult<() => [Action, T], R>,
) {
  while (!step.done) {
    const arr = step.value(),
      state = arr[0],
      value = arr[1]

    switch (state) {
      case PARK:
        setImmediate(function () {
          go_(machine, step)
        })
        return
      case CONTINUE:
        step = machine.next(value)
        break
      case END:
        return value
      default:
        absurd(state)
    }
  }
}

function go<T, R, A extends any[] = []>(
  machine: (...args: A) => Generator<() => [Action, T], R>,
  args: A = [] as any,
) {
  const gen = machine(...args)
  return go_(gen, gen.next())
}



const a = function* () {

}



if (import.meta.vitest) {
  const { it, describe, vi } = import.meta.vitest

  describe('Channel', () => {
    it('should put values to channel', () => {
      const c = chan<number>()
      const spy = vi.fn()
      go(function* () {
        const a = yield put(c, 1)
         const b = yield take(c, spy)
      })
      expect(spy).toHaveBeenCalledWith(1)
    })
    it('Puts and takes should happen in any order', () => {
      const c = chan<number>()
      const spy = vi.fn()
      go(function* () {
        yield take(c, spy)
        yield put(c, 1)
      })
      expect(spy).toHaveBeenCalledWith(1)
    })
  })
  it('test 1', () => {
    const c = chan<number>()
    go(function* () {
      for (let i = 0; i < 10; i++) {
        const a = yield put(c, i)
        console.log('process one put', i)
        // yield timeout(1000)
      }
      yield put(c, null)
    })

    go(function* () {
      while (true) {
        const val: number = yield take(c)
        if (val == null) {
          console.log('process two end')
          break
        } else {
          console.log('process two took', val)
        }
      }
    })
  })

  it('test 2', () => {
    function* player(name: string, table: Channel<{ hits: number }>) {
      while (true) {
        const ball = yield take(table)

        if (ball === null) {
          console.log(name + ": table's gone")
          return
        }

        ball.hits += 1
        console.log(`${name} ${ball.hits}`)
        if (ball.hits >= 10) {
          console.log(name + ' wins!')
          return
        }
        yield timeout(100)
        yield put(table, ball)
      }
    }

    // go(function* () {
    //   const table = chan<{ hits: number }>()

    //   go(player, ['ping', table])
    //   go(player, ['pong', table])

    //   yield put(table, { hits: 0 })
    //   yield timeout(1000)

    //   close(table)
    // })
  })
}
