import { absurd } from 'src/functions'
import { Channel, close, Instruction, put } from '.'

export const go = <T>(
  generator: Iterator<Instruction<T>, T, T | null>,
  channel: Channel<T>,
) => {
  ;(function go_(state: IteratorResult<Instruction<T>, T>) {
    if (!state.done && !channel.closed) {
      const instruction = state.value
      switch (instruction._tag) {
        case 'take': {
          if (channel.buffer.length > 0) {
            setImmediate(() =>
              go_(generator.next(channel.buffer.shift() ?? null)),
            )
          } else {
            channel.takers.push((value) => {
              go_(generator.next(value))
            })
          }
          break
        }
        case 'put': {
          const firstTaker = channel.takers.shift()
          if (firstTaker) {
            setImmediate(() => firstTaker(instruction.value))
          } else {
            channel.buffer.push(instruction.value)
          }
          go_(generator.next(instruction.value))
          break
        }
        case 'async': {
          instruction.promise.then((value) => {
            go_({ done: false, value: put(value) })
          })
          break
        }
        case 'sleep': {
          setTimeout(() => {
            go_(generator.next(null))
          }, instruction.ms)
          break
        }
        default: {
          absurd(instruction)
        }
      }
    } else if (state.done) {
      close(channel, state.value)
    }
  })(generator.next())
}
