import { Effect } from 'src/Effect'
import { singleShotGen } from 'src/Effect/internal/singleshotgen'
import { yieldWrap } from 'src/Effect/internal/yieldwrap'
import * as Op from 'src/RuntimeOp'
// export type ServiceType = ReturnType<typeof inject>

// export type FilterRequirement<T> = T extends ServiceType ? T : never

export const Service =
  (id: string) =>
  <Self, Shape>(): Effect<Shape, never, Self> &
    (new (...args: any[]) => any) => {
    return class {
      static ops = [Op.pure(42 as Shape)]
      static [Symbol.iterator]() {
        return singleShotGen(yieldWrap(this))
      }
    } satisfies Effect<Shape, never, Self>
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
