import { Either, left, right } from '.'

/**
 * Creates an `Either` by executing a function that may throw.
 * If the function succeeds, returns `Right` with the result.
 * If it throws, returns `Left` with the error (or the result of the error handler).
 *
 * @typeParam E - The error type.
 * @typeParam A - The success type.
 * @param f - The function to execute.
 * @param onThrow - Optional error mapping function (defaults to identity).
 * @returns an `Either<E, A>`
 *
 * @example
 * ```ts
 * import { tryCatch } from '@funkp/core/Either/tryCatch'
 * const parse = (s: string) => tryCatch(() => JSON.parse(s), e => String(e))
 * parse('{"a":1}') // Right({ a: 1 })
 * parse('nope')    // Left('SyntaxError: Unexpected token n in JSON at position 0')
 * ```
 */

export function tryCatch<E = unknown, A = unknown>(
  f: () => A,
  onThrow: (e: unknown) => E = (e) => e as E,
): Either<E, A> {
  try {
    return right(f())
  } catch (e) {
    return left(onThrow(e))
  }
}

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest

  it('returns Right when function succeeds', () => {
    const result = tryCatch(() => 42)
    expect(result).toEqual({ _tag: 'Right', right: 42 })
  })

  it('returns Left when function throws', () => {
    const result = tryCatch(() => {
      throw new Error('fail')
    })
    expect(result).toEqual({ _tag: 'Left', left: expect.any(Error) })
  })

  it('maps error with onError', () => {
    const result = tryCatch(
      () => {
        throw new Error('fail')
      },
      (e) => (e instanceof Error ? e.message : String(e)),
    )
    expect(result).toEqual({ _tag: 'Left', left: 'fail' })
  })
}
