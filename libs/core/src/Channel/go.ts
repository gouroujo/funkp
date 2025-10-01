import * as Context from '../Context'
import { absurd } from '../functions'
import { close } from './close'
import { put } from './operations'
import type { Channel, Instruction } from './types'

export const go = <T>(
  generator: Iterator<Instruction<T> | Context.Requirement, T, any>,
  channel: Channel<T>,
  context: Context.Context = {},
) => {
  ;(function go_(
    state: IteratorResult<Instruction<T> | Context.Requirement, T>,
  ) {
    if (!state.done && !channel.closed) {
      const instruction = state.value
      switch (instruction._tag) {
        case 'take': {
          const value = channel.buffer.take()
          if (value !== null) {
            setImmediate(() => go_(generator.next(value)))
          } else {
            channel.takers.push((value) => {
              go_(generator.next(value))
            })
          }
          break
        }
        case 'put': {
          const value = instruction.value
          if (value instanceof Promise) {
            value.then((resolved) => go_({ done: false, value: put(resolved) }))
            break
          }
          const firstTaker = channel.takers.shift()
          if (firstTaker) {
            setImmediate(() => firstTaker(value))
          } else if (channel.buffer.put(value)) {
            go_(generator.next(value))
          } else {
            setImmediate(() => go_(state))
          }
          break
        }
        case 'requirement': {
          if (context.services?.has(instruction.id)) {
            go_(generator.next(context.services.get(instruction.id)))
          } else {
            throw new Error(
              `Requirement ${instruction.id} has not been found in the current context.`,
            )
          }
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
