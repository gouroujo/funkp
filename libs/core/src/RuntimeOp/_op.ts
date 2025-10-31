import { Either } from '../Either'
import { Runtime } from '../Runtime'

export interface Operation<T = unknown> {
  _op: Readonly<string | symbol>
  value?: T
}

export type SyncOperationHandler<T extends Operation> = (
  op: T,
  runtime: Runtime<unknown>,
) => Either<unknown, unknown>
export type AsyncOperationHandler<T extends Operation> = (
  op: T,
  runtime: Runtime<unknown>,
) => Promise<Either<unknown, unknown>>
