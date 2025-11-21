import { UnaryFunction } from '../function'
import { First, Last } from '../tuple'

export type Operation<In, Out> = {
  _op: string
  fn: UnaryFunction<In, Out>
}
export type OperationInType<O extends Operation<unknown, unknown>> =
  O extends Operation<infer In, infer _> ? In : never
export type OperationOutType<O extends Operation<unknown, unknown>> =
  O extends Operation<infer _, infer Out> ? Out : never
export type Reducer<Acc, Op> = (acc: Acc, op: Op) => Acc

export type Transducer<In, Out> = <State>(
  r: Reducer<State, Out>,
) => Reducer<State, In>

export const apply =
  <In, Out>(reduce: Reducer<In, Out>) =>
  (state: In, op: Operation<In, Out>) =>
    reduce(state, op.fn(state))

export const stateReducer = <State>(
  state: State,
  update: Partial<State>,
): State => {
  return { ...state, ...update }
}

export function transduce<Ops extends Operation<any, any>[]>(
  reducer: Reducer<OperationInType<Ops[number]>, OperationOutType<Ops[number]>>,
  ops: readonly [...Ops],
  init?: OperationInType<First<[...Ops]>>,
): OperationOutType<Last<[...Ops]>> {
  let state: OperationInType<Ops[number]> = init as OperationInType<Ops[0]>
  const r = apply(reducer)
  for (const op of ops) {
    state = r(state, op)
  }
  return state as OperationOutType<Last<[...Ops]>>
}

if (import.meta.vitest) {
  const { describe, it, expect, expectTypeOf } = import.meta.vitest

  describe('transducer', () => {
    it('apply a list of operation', () => {
      const stringReducer: Reducer<any, string> = (a, b) => b
      const ops = [
        { _op: 'aaa', fn: () => 'aaaa' } as Operation<void, 'aaaa'>,
        { _op: 'bbb', fn: (_) => 'bbba' } as Operation<'aaaa', 'bbba'>,
      ] as const
      const result = transduce(stringReducer, ops)
      expectTypeOf(result).toEqualTypeOf<'bbba'>()
      expect(result).toEqual('bbba')
    })
  })
}
