/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
// import dts from 'vite-plugin-dts'
import tsconfigPaths from 'vite-tsconfig-paths'

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
  cacheDir: '../../node_modules/.vite/<project-root>',

  plugins: [
    // dts({
    //   entryRoot: '.',
    //   tsconfigPath: path.join(__dirname, 'tsconfig.build.json'),
    // }),
    tsconfigPaths(),
    // nxViteTsPaths({ // ----> Doesn't work well with typescript baseUrl
    //   debug: true,
    //   buildLibsFromSource: true,
    // }),
  ],
  test: {
    globals: true,
    includeSource: ['src/**/*.ts'],
    reporters: ['default'],
    setupFiles: ['./vite.setup.ts'],
    coverage: {
      reportsDirectory: '../coverage/<project-root>',
      provider: 'v8',
    },
    testTimeout: 500,
    typecheck: {
      enabled: true,
    },
  },
  define: {
    'import.meta.vitest': 'undefined',
  },
})
