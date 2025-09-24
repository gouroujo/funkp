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
        extend: 'src/extend.ts',
        Either: 'src/either.ts',
      },
      fileName: (format, entryName) => `${entryName}.${format}.js`,
      formats: ['es', 'cjs'],
    },
  },
  cacheDir: '../../node_modules/.vite/libs/vitest',

  plugins: [
    dts({
      entryRoot: 'src',
      tsconfigPath: path.join(__dirname, 'tsconfig.build.json'),
    }),
    nxViteTsPaths(),
  ],
  test: {
    globals: true,
    cache: {
      dir: '../node_modules/.vitest/<project-root>',
    },
    includeSource: ['src/**/*.ts'],
    reporters: ['default'],
    coverage: {
      reportsDirectory: '../coverage/<project-root>',
      provider: 'v8',
    },
  },
  define: {
    'import.meta.vitest': 'undefined',
  },
})
