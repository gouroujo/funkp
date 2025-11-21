import { UnaryFunction } from '../function'

// could be an array of Operation
export const fromArray = <T extends UnaryFunction[]>(
  fns: T,
  initialValue?: any,
) => {
  return (function* (init?: any): Generator<any, any, any> {
    let prev = init
    for (const fn of fns) {
      // with a switch case here dpending of the operation
      prev = yield fn(prev)
    }
  })(initialValue)
}

if (import.meta.vitest) {
  const { describe, it } = import.meta.vitest

  describe('Generator from an array of func', () => {
    const funcs = [
      () => 'hello',
      (v) => v + ' world',
      (s: string) => s.toUpperCase(),
    ]
    const gen = fromArray(funcs)
    let value = gen.next()

    while (!value.done) {
      console.log(value)
      value = gen.next(value.value)
    }
    console.log(value)
  })
}
