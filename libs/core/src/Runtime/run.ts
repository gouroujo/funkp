import { Runtime } from '.'
import { Effect } from '../Effect'
import { Exit } from '../Exit'
import * as RuntimeFiber from '../RuntimeFiber'
import { defaultRuntime } from './create'

export const runPromise =
  <Context = never>(runtime?: Runtime<Context>) =>
  async <Success, Failure>(
    effect: Effect<Success, Failure, never>,
  ): Promise<Success> => {
    const exit = await runPromiseExit(runtime)(effect)
    if ('success' in exit) return exit.success
    throw exit.failure
  }

export const runPromiseExit =
  <Context = never>(runtime?: Runtime<Context>) =>
  <Success, Failure>(
    effect: Effect<Success, Failure, never>,
  ): Promise<Exit<Success, Failure>> => {
    const fiber = runFork(runtime)(effect)
    return RuntimeFiber.await(fiber)
  }

export const runFork =
  <Context = never>(runtime?: Runtime<Context>) =>
  <Success, Failure>(
    effect: Effect<Success, Failure, never>,
  ): RuntimeFiber.RuntimeFiber<Success, Failure, Context> => {
    const fiber = RuntimeFiber.create(effect, runtime ?? defaultRuntime)
    return RuntimeFiber.runLoop(fiber)
  }
