import { describe, expect, it } from 'vitest'
import { Channel, close, go, Instruction, put, sleep, take, wait } from '..'

type Ball = {
  hits: number
}

const player = function* (
  table: Channel<Ball>,
  name: string,
): Generator<Instruction<Ball>, void, Ball | null> {
  while (true) {
    const ball = yield take(table)
    if (!ball) {
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
      close(table)
    }, [])

    const result = await wait(table)
    expect(result.hits).toBeGreaterThan(10)
  })
})
