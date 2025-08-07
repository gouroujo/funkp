export function isIterable(obj: any): obj is Iterable<unknown> {
  return obj != null && typeof obj[Symbol.iterator] === 'function'
}

export function isAsyncIterable(obj: any): obj is AsyncIterable<unknown> {
  return obj != null && typeof obj[Symbol.iterator] === 'function'
}
