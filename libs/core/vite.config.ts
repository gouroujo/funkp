/// <reference types="vitest/config" />
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin'
import * as path from 'path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
  root: __dirname,
  build: {
    outDir: '../../dist/apps/my-app',
    target: 'node22',
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    lib: {
      entry: {
        main: 'src/main.ts',
        functions: 'src/functions/index.ts',
        Option: 'src/Option/index.ts',
        Either: 'src/Either/index.ts',
        Effect: 'src/Effect/index.ts',
      },
      fileName: (format, entryName) => `${entryName}.${format}.js`,
      formats: ['es', 'cjs'],
    },
  },
  cacheDir: '../../node_modules/.vite/apps/my-app',

  plugins: [
    nxViteTsPaths(),
    dts({
      entryRoot: 'src',
      tsconfigPath: path.join(__dirname, 'tsconfig.build.json'),
    }),
  ],
  test: {
    includeSource: ['src/**/*.ts'],
  },
  define: {
    'import.meta.vitest': 'undefined',
  },
})
