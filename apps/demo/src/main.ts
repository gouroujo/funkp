import { Either as E } from '@funkp/core'

const a = E.right(42)

const b = E.isRight(a)
type c = E.RightType<typeof a>
