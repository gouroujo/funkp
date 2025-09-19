import { Effect } from '..'

export function map<PrevSuccess, Success, Failure, Requirements>(
  fn: (value: PrevSuccess) => Success,
): (
  a: Effect<PrevSuccess, Failure, Requirements>,
) => Effect<Success, Failure, Requirements> {
  return (effect: Effect<PrevSuccess, Failure, Requirements>) => ({
    _tag: 'Map',
    effect,
    fn,
    *[Symbol.iterator]() {
      return yield this
    },
  })
}
