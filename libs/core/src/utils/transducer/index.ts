import { curryLeft } from '../function'

function listCombine<T>(list: T[], val: T) {
  list.push(val)
  return list
}
type ArrayCombine<T> = (list: T[], el: T) => T[]

function reducer<T>(list: T[], val: T) {
  if (val) return listCombine(list, val)
  return list
}

const f = <T>(mapperFn: (a: T) => T, combinerFn: ArrayCombine<T>) => {
  return (list: T[], v: T) => combinerFn(list, mapperFn(v))
}
const map = curryLeft(f<string>)

const a = map((v) => v + 'kk')
