export type Exit<Success, Failure> =
  | {
      success: Success
    }
  | {
      failure: Failure
    }

export const succeed = <Success>(value: Success): Exit<Success, never> => {
  return { success: value }
}

export const fail = <Failure>(error: Failure): Exit<never, Failure> => {
  return { failure: error }
}

export const isSuccess = <Success, Failure>(
  exit: Exit<Success, Failure>,
): exit is { success: Success } => {
  return 'success' in exit
}

export const isFailure = <Success, Failure>(
  exit: Exit<Success, Failure>,
): exit is { failure: Failure } => {
  return 'failure' in exit
}
