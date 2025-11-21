export const ON_FAILURE_OP = '@funkp/core/operator/onFailure' as const
export const onFailure = <T, TReturn>(fn: (value: T) => TReturn) => ({
  _op: ON_FAILURE_OP,
  fn,
})
