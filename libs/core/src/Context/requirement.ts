export type Requirement = {
  _tag: 'requirement'
  id: string
}

export type FilterRequirement<T> = T extends Requirement ? T : never

export const RequirementFactory =
  (id: string) =>
  <Self, Shape>() => {
    return class implements Requirement {
      _tag = 'requirement' as const
      id: string = id
      static id = id
      static _tag = 'requirement' as const
      static *[Symbol.iterator](): Generator<Self, Shape, Shape> {
        return yield { _tag: 'requirement', id } as Self
      }
    }
  }

export const isRequirement = (value: unknown): value is Requirement =>
  typeof value === 'object' &&
  value !== null &&
  '_tag' in value &&
  value._tag === 'requirement'

export type RequirementContainer<Shape = any> = {
  new (): Requirement
  id: string
  [Symbol.iterator](): Generator<Requirement, Shape, Shape>
}
