type Channel<T> = {
  buffer: T[]
  takers?: Array<(value: T) => void>
  putters?: Array<[value: T, cb?: (value: T) => void]>
  listeners?: Array<(result: T) => void>
  value?: T
}

type TakeInstruction<T = unknown> = {
  _tag: 'take'
  channel: Channel<T>
}
const isTakeInstruction = <T>(
  inst: Instruction<T>,
): inst is TakeInstruction<T> => {
  return inst._tag === 'take'
}

type PutInstruction<T = unknown> = {
  _tag: 'put'
  channel: Channel<T>
  value: T
}
const isPutInstruction = <T>(
  inst: Instruction<T>,
): inst is PutInstruction<T> => {
  return inst._tag === 'put'
}
type Instruction<T> = TakeInstruction<T> | PutInstruction<T>

const take = <T>(channel: Channel<T>): TakeInstruction<T> => {
  return { _tag: 'take' as const, channel }
}
const takeHandler = <T>(channel: Channel<T>, cb: (value: T) => void) => {
  if (channel.putters && channel.putters.length > 0) {
    const [value, putCb] = channel.putters.shift() as [T, (value: T) => void]
    if (putCb) putCb(value)
    cb(value)
  } else {
    channel.takers = [...(channel.takers ?? []), cb]
  }
}

const put = <T>(channel: Channel<T>, value: T): PutInstruction<T> => {
  return { _tag: 'put' as const, channel, value }
}
const putHandler = <T>(channel: Channel<T>, value: T, cb: () => void) => {
  if (channel.takers && channel.takers.length > 0) {
    const taker = channel.takers.shift() as (value: T) => void
    taker(value)
    channel.value = value
    cb()
  } else {
    channel.putters = [...(channel.putters ?? []), [value, cb]]
  }
}

const wait = <T>(channel: Channel<T>) => {
  return new Promise<T>((resolve) => {
    channel.listeners = [...(channel.listeners ?? []), resolve]
  })
}

const go_ = <T>(
  generator: Generator<Instruction<T>, Channel<T>, T>,
  state?: T,
) => {
  const step = state ? generator.next(state) : generator.next()
  if (!step.done) {
    const instruction = step.value
    if (isTakeInstruction(instruction)) {
      const { channel } = instruction
      takeHandler(channel, (value) => setImmediate(() => go_(generator, value)))
    } else if (isPutInstruction(instruction)) {
      const { channel, value } = instruction
      putHandler(channel, value, () => setImmediate(() => go_(generator)))
    }
  } else {
    console.log('done')
    const channel = step.value
    if (channel.value !== undefined) {
      channel.listeners?.forEach((listener) => listener(channel.value!))
    }
  }
}

const go = <T, A extends unknown[] = never[]>(
  genFn: (...args: A) => Generator<Instruction<T>, Channel<T>, T>,
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
  ): Generator<Instruction<Ball>, Channel<Ball>, Ball> {
    while (true) {
      const ball = yield take(table)
      if (ball === null) {
        console.log(name + ": table's gone")
        return table
      }
      ball.hits += 1
      console.log(`${name} ${ball.hits}`)
      if (ball.hits >= 10) {
        console.log(name + ' wins!')
        return table
      }
      console.log(name + ' played')
      yield put(table, ball)
      console.log(name, table.putters, table.takers)
    }
  }

  describe('gene', () => {
    it('should work', async () => {
      const table: Channel<Ball> = { buffer: [] }
      go(function* (): Generator<Instruction<Ball>, Channel<Ball>, Ball> {
        go(player, [table, 'ping'])
        go(player, [table, 'pong'])
        yield put(table, { hits: 0 })
        console.log('game started')
        return table
      }, [])
      const result = await wait(table)
      // await new Promise((resolve) => setTimeout(resolve, 1000))
      expect(result.hits).toBeGreaterThanOrEqual(10)
    })
  })
}
