const iterator = {
  buffer: [] as string[],
  [Symbol.iterator]: function* () {
    yield* this.buffer
    yield 'b'
    yield 'c'
  },
}

if (import.meta.vitest) {
  const { it, describe, expect } = import.meta.vitest
  describe('test', () => {
    it('should work', () => {
      iterator.buffer.push('a', 'v')
      const aaa = iterator[Symbol.iterator]()
      const r1 = aaa.next()
      expect(r1).toEqual({ value: 'a', done: false })
      const r2 = aaa.next()
      expect(r2).toEqual({ value: 'v', done: false })
      const r3 = aaa.next()
      expect(r3).toEqual({ value: 'b', done: false })
      const r4 = aaa.next()
      expect(r4).toEqual({ value: 'c', done: false })
      const r5 = aaa.next()
      expect(r5).toEqual({ value: undefined, done: true })
    })
  })
}
