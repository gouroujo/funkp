import tsdocPlugin from 'eslint-plugin-tsdoc'
import baseConfig from '../../eslint.config.mjs'

export default [
  ...baseConfig,
  {
    files: ['**/*.ts'],
    plugins: {
      tsdoc: tsdocPlugin,
    },
    rules: {
      'tsdoc/syntax': 'warn',
    },
  },
]
