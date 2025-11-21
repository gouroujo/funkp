if (import.meta.vitest) {
  const { it } = import.meta.vitest
  it('tst', () => {
    const array = [1, 2, 3, 4]
    const iterator = array.values()
    let a = iterator.next()
    while (!a.done) {
      console.log(a.value)
      if (a.value === 2) {
        array.push(5)
      }
      a = iterator.next()
    }
  })
}
