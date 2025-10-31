export interface Pipeable {
  pipe(f1: (v: this) => any): any
}

const make = <T>(obj: T): T & Pipeable =>
  Object.assign(obj, {
    pipe: (f) => f(this),
  })

interface S extends Pipeable {
  aaa: string
}

const a: S
