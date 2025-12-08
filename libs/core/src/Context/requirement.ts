import { inject } from 'src/RuntimeOp'

export type ServiceType = ReturnType<typeof inject>

export type FilterRequirement<T> = T extends ServiceType ? T : never

export const Service =
  (id: string) =>
  <Self, Shape>() => {
    return class implements ServiceType {
      value = id
      _action = 'inject' as const
      id = id
      static id = id
      static *[Symbol.iterator](): Generator<Self, Shape, Shape> {
        return yield inject(id) as Self
      }
    }
  }

// export const isRequirement = (value: unknown): value is Requirement =>
//   typeof value === 'object' &&
//   value !== null &&
//   '_tag' in value &&
//   value._tag === 'requirement'

export type ServiceContainer<Shape = any> = {
  new (): ServiceType
  id: string
  [Symbol.iterator](): Generator<ServiceType, Shape, Shape>
}
