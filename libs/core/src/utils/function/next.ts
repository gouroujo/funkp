type Handler = (value: true) => void

export const next = (handler: Handler): void => {
  if (typeof process !== 'undefined') {
    // NodeJS.Process
    process.nextTick(function callAcquirer(this: unknown) {
      handler.call(this, true)
    })
  } else {
    // DOM
    queueMicrotask(function callAcquirer(this: unknown) {
      handler.call(this, true)
    })
  }
}
