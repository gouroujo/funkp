import { nominal } from '../Brand'
import type { RuntimeFiberId } from './fiber'

export const Id = () => {
  const construct = nominal<RuntimeFiberId>()
  return construct(crypto.randomUUID())
}
