import * as Context from 'src/Context'
import type { Runtime } from '.'
import { create } from './create'

export const mergeContext = <R1, R2>(
  runtime: Runtime<R1>,
  context: Context.Context<R2>,
): Runtime<R1 | R2> => {
  const merged = Context.merge(runtime.context, context)
  return create(merged)
}
