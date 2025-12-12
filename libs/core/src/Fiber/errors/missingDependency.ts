export class MissingDependencyError extends Error {
  constructor(dependency: string) {
    super(`Missing dependency : ${dependency}`)
    this.name = 'MissingDependencyError'
  }
}

export const isMissingDependencyError = (
  error: unknown,
): error is MissingDependencyError => {
  return error instanceof MissingDependencyError
}
