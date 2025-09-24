export const PARK = Symbol('PARK')
export const CONTINUE = Symbol('CONTINUE')
type Instruction<T> = [typeof PARK] | [typeof CONTINUE, T]
type Channel<T> = {
  buffer: T[]
  takers?: Map<string, T>
}

type TakeInstruction = {
    _tag: 'take'
    channel: Channel<unknown>
}
const take = <T>(channel: Channel<T>): (() => Instruction<T>) => {
const id = Math.random().toString(36).substring(2, 15)
  return () => {
    const value = channel.buffer.shift()
    if (value === undefined) {
      return [PARK]
    } else {
      return [CONTINUE, value]
    }
  }
}

const put = <T>(channel: Channel<T>, value: T): (() => Instruction<T>) => {
  return () => {
    channel.buffer.push(value)
    return [CONTINUE, value]
  }
}

const go_ = <T>(
  generator: Generator<() => Instruction<T>, void, T>,
  step: IteratorResult<() => Instruction<T>, void> = generator.next(),
) => {
  if (!step.done) {
    const [state, value] = step.value()
    switch (state) {
      case PARK:
        setImmediate(function () {
          go_(generator, step)
        })
        break
      case CONTINUE:
        go_(generator, generator.next(value))
        break
    }
  }
}

const go = <T, A extends unknown[] = never[]>(
  genFn: (...args: A) => Generator<() => Instruction<T>, void, T>,
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
  ): Generator<() => Instruction<Ball>, void, Ball> {
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
      yield put(table, ball)
    }
  }

  describe('gene', () => {
    it('should work', () => {
      const table: Channel<Ball> = { buffer: [] }
      const ball: Ball = { hits: 0 }
      go(function* (): Generator<() => Instruction<Ball>, void, Ball> {
        go(player, [table, 'ping'])
        go(player, [table, 'pong'])
        yield put(table, ball)
      }, [])
    })
  })
}
