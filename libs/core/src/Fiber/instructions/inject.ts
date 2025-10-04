export type InjectInstruction = {
  _action: 'inject'
  value: string
}
export const inject = <T>(id: string): InjectInstruction => ({
  _action: 'inject' as const,
  value: id,
})
