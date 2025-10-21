export type Exit<Success, Failure> = {
  success?: Success
  failure?: Failure
}

export const succeed = <Success>(value: Success): Exit<Success, never> => {
  return { success: value }
}

export const fail = <Failure>(error: Failure): Exit<never, Failure> => {
  return { failure: error }
}
