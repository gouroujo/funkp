export type TakeInstruction = {
  _tag: 'take'
}

export const take = (): TakeInstruction => {
  return { _tag: 'take' }
}
