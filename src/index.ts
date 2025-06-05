import type { ESLint, Linter } from 'eslint'
import pnpmPlugin from 'eslint-plugin-pnpm'
import * as jsoncParser from 'jsonc-eslint-parser'
import * as yamlParser from 'yaml-eslint-parser'
import { name, version } from '../package.json'
import { rules } from './rules'

export const plugin: ESLint.Plugin = {
  meta: {
    name,
    version,
  },
  rules: {
    ...pnpmPlugin.rules,
    ...rules,
  },
}

const jsonConfig: Linter.Config = {
  name: 'eslint-plugin-pnpm-catalog/package.json',
  files: [
    'package.json',
    '**/package.json',
  ],
  languageOptions: {
    parser: jsoncParser,
  },
  plugins: {
    'pnpm': pnpmPlugin,
    'pnpm-catalog': plugin,
  },
  rules: {
    'pnpm-catalog/json-enforce-named-catalogs': 'warn',
    'pnpm/json-enforce-catalog': 'error',
    'pnpm/json-valid-catalog': 'error',
    'pnpm/json-prefer-workspace-settings': 'error',
  },
}

const yamlConfig: Linter.Config = {
  ...(pnpmPlugin.configs!.yaml as Linter.Config[])[0],
  name: 'eslint-plugin-pnpm-catalog/pnpm-workspace',
  languageOptions: {
    parser: yamlParser,
  },
}

export const configs = {
  recommended: [jsonConfig, yamlConfig],
} satisfies ESLint.Plugin['configs']

plugin.configs = configs
export default plugin
