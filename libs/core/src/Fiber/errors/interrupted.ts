export class InterruptedError extends Error {
  constructor() {
    super('Fiber interrupted')
    this.name = 'InterruptedError'
  }
}

export const isInterruptedError = (
  error: unknown,
): error is InterruptedError => {
  return error instanceof InterruptedError
}
