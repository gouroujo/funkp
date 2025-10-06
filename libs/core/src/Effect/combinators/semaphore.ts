export type AsyncTask<TReturn = any> = () => Promise<TReturn>

async function* worker<T extends AsyncTask<any>>(): AsyncGenerator<
  [number, Awaited<ReturnType<T>>] | null,
  void,
  readonly [index: number, task: T] | undefined
> {
  let task = yield null
  while (task) {
    task = yield [task[0], await task[1]()]
  }
}

type ReturnMap<E extends AsyncTask<unknown>[]> = {
  [I in keyof E]: Awaited<ReturnType<E[I]>>
}

export const semaphore = (concurrency: number) => {
  return async <T extends AsyncTask<any>[]>(
    tasks: readonly [...T],
  ): Promise<ReturnMap<T>> => {
    const t = tasks.map((task, i) => [i, task] as const)
    const results: Awaited<ReturnType<T[number]>>[] = []
    const run = async (
      gen: ReturnType<typeof worker<T[number]>>,
      init = false,
    ): Promise<void> => {
      return gen.next(init ? t.shift() : undefined).then((value) => {
        if (value.value) results[value.value[0]] = value.value[1]
        if (value.done === false) return run(gen, true)
        return
      })
    }
    const promises = new Array(Math.min(concurrency, tasks.length + 1))
      .fill(null)
      .map(() => run(worker<Awaited<ReturnType<T[number]>>>()))
    return Promise.all(promises).then(() => results as ReturnMap<T>)
  }
}

if (import.meta.vitest) {
  const { describe, it, expect, expectTypeOf } = import.meta.vitest
  const makeTask = <T>(n: T, delay: number) => {
    return () => {
      return new Promise<T>((resolve) => {
        setTimeout(() => {
          resolve(n)
        }, delay)
      })
    }
  }

  describe('Semaphore', async () => {
    it('should execute all tasks and return result in order', async () => {
      const tasks = [
        makeTask('a' as const, 10),
        makeTask('b' as const, 100),
        makeTask('c' as const, 50),
        makeTask('d' as const, 20),
        makeTask('e' as const, 0),
      ] as const
      const sem = semaphore(2)
      const result = await sem(tasks)
      expectTypeOf(result).toEqualTypeOf<['a', 'b', 'c', 'd', 'e']>()
      expect(result).toEqual(['a', 'b', 'c', 'd', 'e'])
    })
    it('should reject when error is encoutered', async () => {
      const tasks = [
        makeTask('a' as const, 10),
        makeTask('b' as const, 100),
        makeTask('c' as const, 50),
        () => Promise.reject('fail'),
        () => Promise.reject('fail2'),
        makeTask('d' as const, 20),
        makeTask('e' as const, 0),
      ] as const
      const sem = semaphore(2)
      await expect(sem(tasks)).rejects.toEqual('fail')
    })
  })
}
