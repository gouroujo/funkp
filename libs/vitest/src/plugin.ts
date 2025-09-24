import { expect } from 'vitest'
import type { Vite, VitestPluginContext } from 'vitest/node'
import * as matchers from './matchers'

export function plugin(): Vite.Plugin {
  return {
    name: 'vitest:my-plugin',
    configureVitest(context: VitestPluginContext) {
      expect.extend(matchers)
    },
  }
}
