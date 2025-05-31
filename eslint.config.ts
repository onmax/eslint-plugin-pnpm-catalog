// @ts-check
import antfu from '@antfu/eslint-config'
import { configs } from './src'

export default antfu(
  {
    type: 'lib',
    formatters: true,
  },
  ...configs.recommended,
)
