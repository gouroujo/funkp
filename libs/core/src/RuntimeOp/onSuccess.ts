export const ON_SUCCESS_OP = '@funkp/core/operator/onSuccess' as const
export const onSuccess = <T, TReturn>(fn: (value: T) => TReturn) => ({
  _op: ON_SUCCESS_OP,
  fn,
})
