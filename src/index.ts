import type { ESLint, Linter } from 'eslint'
import * as jsoncParser from 'jsonc-eslint-parser'
import { name, version } from '../package.json'
import { rules } from './rules'

export const plugin: ESLint.Plugin = {
  meta: {
    name,
    version,
  },
  rules,
}

const recommended: Linter.Config = {
  name: 'eslint-plugin-pnpm-catalog/recommended',
  files: [
    'package.json',
    '**/package.json',
  ],
  languageOptions: {
    parser: jsoncParser,
  },
  plugins: {
    'pnpm-catalog': plugin,
  },
  rules: {
    'pnpm-catalog/json-enforce-named-catalogs': 'warn',
  },
}

export const configs = {
  recommended: [recommended],
} satisfies ESLint.Plugin['configs']

plugin.configs = configs
export default plugin
