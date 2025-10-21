import type { Context } from '../Context'

export type RuntimeFlags = {
  cooperativeYielding: boolean
}
export type Runtime<R> = {
  context: Context<R>
  fiberRefs: string[]
  flags: RuntimeFlags
}
export * from './create'
export * from './run'
