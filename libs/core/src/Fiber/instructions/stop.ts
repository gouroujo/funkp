export const stop = <T>(reason: T) => ({
  _action: 'stop' as const,
  reason,
})
