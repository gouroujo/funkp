
export const PROVIDE_OP = '@funkp/core/operator/provide' as const
export const provide =
  <T>(service: T, impl: any) =>
  (value: any) => ({
    _op: PROVIDE_OP,
    service,
    impl,
    value,
  })
