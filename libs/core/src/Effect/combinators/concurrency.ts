import { Effect } from '..'

export type Concurrency = number | 'unbounded' | 'inherit' | undefined

export const concurrency = (
  value: Concurrency,
  inherited?: number | 'unbounded',
): number => {
  switch (value) {
    case 'inherit':
      return concurrency(inherited)
    case 'unbounded':
      return Infinity
    case undefined:
      return 1
    default:
      return value
  }
}

export function withConcurrency<E extends Effect<unknown, unknown, unknown>>(
  value: NonNullable<Concurrency>,
) {
  return (effect: E) => {
    return effect
  }
}
