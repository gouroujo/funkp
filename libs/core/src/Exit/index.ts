import * as E from '../Either'

export type SuccessExit<T> = {
  success: any | T
}
export type FailureExit<T> = {
  failure: any | T
}
export type Exit<Success, Failure> = SuccessExit<Success> | FailureExit<Failure>
export const succeed = <Success>(value: Success): SuccessExit<Success> => {
  return { success: value }
}

export const fail = <Failure>(error: Failure): FailureExit<Failure> => {
  return { failure: error }
}

export const interrupted = (fiber: any): FailureExit<'Interrupted'> => {
  return { failure: 'Interrupted' }
}
export const interruptFail = (
  fiber: any,
  err: unknown,
): Exit<never, 'Interrupted'> => {
  return { failure: 'Interrupted' }
}

export const isExit = <Success, Failure>(
  value: unknown,
): value is Exit<Success, Failure> => {
  return (
    typeof value === 'object' &&
    value !== null &&
    ('success' in value || 'failure' in value)
  )
}

export const isSuccess = <Success, Failure>(
  exit: Exit<Success, Failure>,
): exit is SuccessExit<Success> => {
  return 'success' in exit
}

export const isFailure = <Success, Failure>(
  exit: Exit<Success, Failure>,
): exit is FailureExit<Failure> => {
  return 'failure' in exit
}

export const fromEither = <Success, Failure>(
  either: E.Either<Failure, Success>,
): Exit<Success, Failure> => {
  return E.isRight(either) ? succeed(either.right) : fail(either.left)
}
