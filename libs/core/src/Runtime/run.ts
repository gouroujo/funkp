import { Runtime } from '.'
import { Effect } from '../Effect'
import { Exit } from '../Exit'
import * as RuntimeFiber from '../RuntimeFiber'
import { defaultRuntime } from './create'

export const runPromiseExit =
  <Context = never>(runtime?: Runtime<Context>) =>
  <Success, Failure>(
    effect: Effect<Success, Failure, Context>,
  ): Promise<Exit<Success, Failure>> => {
    const _runtime = runtime ?? defaultRuntime
    const fiber = runFork(_runtime)(effect)
    return RuntimeFiber.await(fiber)
  }
export const runPromise =
  <Context = never>(runtime?: Runtime<Context>) =>
  async <Success, Failure>(
    effect: Effect<Success, Failure, Context>,
  ): Promise<Success> => {
    const _runtime = runtime ?? defaultRuntime
    const exit = await runPromiseExit(_runtime)(effect)
    if ('success' in exit) return exit.success
    throw exit.failure
  }

export const runFork =
  <Context = never>(runtime?: Runtime<Context>) =>
  <Success, Failure>(
    effect: Effect<Success, Failure, Context>,
  ): RuntimeFiber.RuntimeFiber<Success, Failure> => {
    const _runtime = runtime ?? defaultRuntime
    const rootFiber = RuntimeFiber.create(effect)
    return RuntimeFiber.runLoop(rootFiber, _runtime)
  }
