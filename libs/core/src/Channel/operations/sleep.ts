export type SleepInstruction<T> = {
  _tag: 'sleep'
  ms: number
}

export const sleep = <T>(ms: number): SleepInstruction<T> => {
  return { _tag: 'sleep', ms }
}
