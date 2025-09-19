const gene = function* (
  fn: (v: string) => string,
): Generator<string, string, string> {
  const a = yield 'aaa'
  const b = yield fn(`Hello ${a}`)
  return `Bonjour ${a} ${b}`
}

const gene2 = function* (
  fn: (v: string) => string,
): Generator<string, string, string> {
  const a = yield* gene(fn)
  return `BONJOUR ${a}`
}

if (import.meta.vitest) {
  const { it, describe, expect, vi } = import.meta.vitest

  describe('gene', () => {
    it('should work', () => {
      const spy = vi.fn((a) => a)
      const iterator = gene(spy)
      let result = iterator.next()
      expect(result).toEqual({
        done: false,
        value: 'aaa',
      })
      expect(spy).not.toHaveBeenCalled()
      result = iterator.next('World')
      expect(spy).toHaveBeenCalledWith('Hello World')
      expect(result).toEqual({
        done: false,
        value: 'Hello World',
      })
      result = iterator.next('no')
      expect(result).toEqual({
        done: true,
        value: 'Bonjour World no',
      })
    })
  })
  describe('gene2', () => {
    it('should work', () => {
      const spy = vi.fn((a) => a)
      const iterator = gene2(spy)
      let result = iterator.next()
      expect(result).toEqual({
        done: false,
        value: 'aaa',
      })
      result = iterator.next('World')
      expect(result).toEqual({
        done: false,
        value: 'Hello World',
      })
      result = iterator.next('aa')
      expect(result).toEqual({
        done: true,
        value: 'BONJOUR Bonjour World aa',
      })
    })
  })
}
