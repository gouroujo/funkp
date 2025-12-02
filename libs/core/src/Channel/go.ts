import { absurd } from 'src/functions'
import * as O from 'src/Option'
import type { Channel } from './chan'
import { close } from './close'
import { type Instruction, put } from './instructions'

export const go = <T, A extends unknown[] = never[]>(
  genFn: (...args: A) => Generator<Instruction<T>, unknown, T>,
  args: A,
) => {
  const gen = genFn(...args)
  go_(gen, gen.next())
}

const go_ = <T>(
  generator: Generator<Instruction<T>, unknown, T>,
  step: IteratorResult<Instruction<T>, unknown>,
) => {
  if (step.done === false) {
    const instruction = step.value
    switch (instruction._tag) {
      case 'take': {
        const { channel } = instruction
        const value = channel.buffer.take()
        if (O.isSome(value)) {
          setImmediate(() => go_(generator, generator.next(value.value)))
        } else {
          channel.takers.push((v) => {
            go_(generator, generator.next(v))
          })
        }
        break
      }
      case 'put': {
        const { channel, value } = instruction
        if (value instanceof Promise) {
          value.then((resolved) =>
            go_(generator, { done: false, value: put(channel, resolved) }),
          )
          break
        }
        const firstTaker = channel.takers.shift()
        if (firstTaker) {
          setImmediate(() => firstTaker(value))
          go_(generator, generator.next(value))
        } else if (channel.buffer.put(value)) {
          go_(generator, generator.next(value))
        } else {
          setImmediate(() => go_(generator, step))
        }
        break
      }
      case 'sleep': {
        const { ms } = instruction
        setTimeout(() => {
          go_(generator, generator.next())
        }, ms)
        break
      }
      default: {
        absurd(instruction)
      }
    }
  }
}

if (import.meta.vitest) {
  const { it, describe, expect, vi } = import.meta.vitest
  const { put, take, sleep } = await import('./instructions')
  const { chan } = await import('./chan')
  const { wait } = await import('./wait')

  describe('Channel.go : Ping/Pong CSP', () => {
    type Ball = {
      hits: number
    }
    const player = function* (
      table: Channel<Ball>,
      name: string,
      spy: (...args: any[]) => void,
    ): Generator<Instruction<Ball>, void, Ball> {
      while (true) {
        const ball = yield take(table)
        if (ball === null) {
          break
        }
        ball.hits += 1
        spy(name, ball.hits)
        yield put(table, ball)
      }
    }
    it('should work if we put the table before the players', async () => {
      const table = chan<Ball>(1)
      const spy = vi.fn()
      go(function* (): Generator<Instruction<Ball>, void, Ball> {
        yield put(table, { hits: 0 })
        go(player, [table, 'ping', spy])
        go(player, [table, 'pong', spy])
        yield sleep(table, 10)
        const ball = yield take(table)
        if (ball) {
          close(table, ball)
        }
      }, [])

      const result = await wait(table)
      expect(result.hits).toBeGreaterThan(10)
      spy.mock.calls.forEach((call, index) => {
        if (index % 2 === 0) {
          expect(call).toEqual(['ping', index + 1])
        } else {
          expect(call).toEqual(['pong', index + 1])
        }
      })
    })
    it('should work if we put the table after the players', async () => {
      const table = chan<Ball>(1)
      const spy = vi.fn()
      go(function* (): Generator<Instruction<Ball>, void, Ball> {
        go(player, [table, 'ping', spy])
        go(player, [table, 'pong', spy])
        yield put(table, { hits: 0 })
        yield sleep(table, 10)
        const ball = yield take(table)
        if (ball) {
          close(table, ball)
        }
      }, [])

      const result = await wait(table)
      expect(result.hits).toBeGreaterThan(10)
      spy.mock.calls.forEach((call, index) => {
        if (index % 2 === 0) {
          expect(call).toEqual(['ping', index + 1])
        } else {
          expect(call).toEqual(['pong', index + 1])
        }
      })
    })
  })
}
