export type SleepInstruction = {
  _tag: 'sleep'
  ms: number
}

export const sleep = (ms: number): SleepInstruction => {
  return { _tag: 'sleep', ms }
}
