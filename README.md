# eslint-plugin-pnpm-catalog

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![bundle][bundle-src]][bundle-href]
[![JSDocs][jsdocs-src]][jsdocs-href]
[![License][license-src]][license-href]

ESLint plugin that enforces the use of named catalogs in pnpm workspaces. Automatically migrates plain dependency specifiers to catalog references and organizes them into categorized catalogs.

## Features

- 🔧 **Automatic migration**: Converts plain version specifiers to catalog references
- 📦 **Smart categorization**: Automatically categorizes dependencies into appropriate catalogs (e.g., `frontend`, `dev`, `testing`)
- 🎯 **Custom rules**: Define your own categorization rules with regex patterns or exact matches
- ⚡ **Conflict resolution**: Handles version conflicts with configurable strategies
- 🛠️ **Auto-fix**: Automatically updates both `package.json` and `pnpm-workspace.yaml`

## Installation

```bash
pnpm add --save-dev eslint-plugin-pnpm-catalog

```

## Usage

Add the plugin to your ESLint config (Flat Config):

```js
import eslintCatalogPlugin from 'eslint-plugin-pnpm-catalog'

export default [
  {
    files: ['package.json'],
    plugins: {
      'pnpm-catalog': eslintCatalogPlugin,
    },
    rules: {
      'pnpm-catalog/json-enforce-named-catalogs': 'warn',
    },
  },
]
```

Or use the recommended configuration:

```js
import eslintCatalogPlugin from 'eslint-plugin-pnpm-catalog'

export default [
  eslintCatalogPlugin.configs.recommended,
]
```

## Rules

The recommended configuration enables the following rules in this order:

1. `pnpm-catalog/json-enforce-named-catalogs`
2. `pnpm/json-enforce-catalog`
3. `pnpm/json-valid-catalog`
4. `pnpm/json-prefer-workspace-settings`
5. `pnpm/yaml-no-unused-catalog-item`
6. `pnpm/yaml-no-duplicate-catalog-item`

> This plugin is built on top of the [eslint-plugin-pnpm](https://github.com/antfu/pnpm-workspace-utils/tree/main/packages/eslint-plugin-pnpm)

### `json-enforce-named-catalogs`

Enforces the use of named catalogs instead of plain version specifiers in `package.json` files. This rule helps maintain consistency across your workspace by organizing dependencies into logical catalogs.

#### Options

```
{
  allowedProtocols?: string[]          // Default: ['workspace', 'link', 'file']
  autofix?: boolean                    // Default: true
  conflicts?: 'new-catalog' | 'overrides' | 'error'  // Default: 'new-catalog'
  fields?: string[]                    // Default: ['dependencies', 'devDependencies']
  customRules?: CatalogRule[]          // Default: []
}
```

##### `allowedProtocols`

Array of protocol prefixes that should not be converted to catalogs (e.g., `workspace:`, `link:`, `file:`).

##### `autofix`

Whether to automatically fix violations by updating both `package.json` and `pnpm-workspace.yaml`.

##### `conflicts`

Strategy for handling version conflicts when adding packages to existing catalogs:

- `new-catalog`: Create a new catalog for conflicting versions
- `overrides`: Override the existing catalog entry
- `error`: Report an error without fixing

##### `fields`

Array of package.json fields to check for dependencies.

##### `customRules`

Array of custom categorization rules:

```ts
interface CatalogRule {
  name: string // Catalog name
  match: string | string[] // Package name patterns (supports regex)
  depFields?: string[] // Dependency fields this rule applies to
  priority?: number // Rule priority (higher = more important)
}
```

#### Examples

**Basic usage:**

```json
// package.json (before)
{
  "dependencies": {
    "react": "^18.0.0",
    "vue": "^3.5.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0"
  }
}
```

```json
// package.json (after)
{
  "dependencies": {
    "react": "catalog:frontend",
    "vue": "catalog:frontend"
  },
  "devDependencies": {
    "@types/node": "catalog:dev"
  }
}
```

```yaml
# pnpm-workspace.yaml (updated)
catalogs:
  frontend:
    react: ^18.0.0
    vue: ^3.5.0
  dev:
    '@types/node': ^20.0.0
```

**With custom rules:**

```json
{
  "rules": {
    "pnpm-catalog/json-enforce-named-catalogs": ["warn", {
      "customRules": [
        {
          "name": "ui-components",
          "match": ["@mui/*", "@chakra-ui/*", "antd"],
          "priority": 100
        },
        {
          "name": "testing",
          "match": "^(vitest|jest|@testing-library/)",
          "depFields": ["devDependencies"],
          "priority": 90
        }
      ]
    }]
  }
}
```

**Conflict handling:**

```json
{
  "rules": {
    "pnpm-catalog/json-enforce-named-catalogs": ["warn", {
      "conflicts": "new-catalog" // Creates new catalogs for conflicts
    }]
  }
}
```

## Acknowledgments

This work has been inspired by the work of [pncat](https://github.com/jinghaihan/pncat).

Also special thanks to [Anthony Fu](https://github.com/antfu) for:

- His work on [pnpm-workspace-utils](https://github.com/antfu/pnpm-workspace-utils) which provided the foundation for this plugin.
- His article [Categorizing Dependencies](https://antfu.me/posts/categorize-deps) which provided great inspiration.

## License

[MIT](./LICENSE) License © [onmax](https://github.com/onmax)

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/eslint-plugin-pnpm-catalog?style=flat&colorA=080f12&colorB=1fa669
[npm-version-href]: https://npmjs.com/package/eslint-plugin-pnpm-catalog
[npm-downloads-src]: https://img.shields.io/npm/dm/eslint-plugin-pnpm-catalog?style=flat&colorA=080f12&colorB=1fa669
[npm-downloads-href]: https://npmjs.com/package/eslint-plugin-pnpm-catalog
[bundle-src]: https://img.shields.io/bundlephobia/minzip/eslint-plugin-pnpm-catalog?style=flat&colorA=080f12&colorB=1fa669&label=minzip
[bundle-href]: https://bundlephobia.com/result?p=eslint-plugin-pnpm-catalog
[license-src]: https://img.shields.io/github/license/onmax/eslint-plugin-pnpm-catalog.svg?style=flat&colorA=080f12&colorB=1fa669
[license-href]: https://github.com/onmax/eslint-plugin-pnpm-catalog/blob/main/LICENSE
[jsdocs-src]: https://img.shields.io/badge/jsdocs-reference-080f12?style=flat&colorA=080f12&colorB=1fa669
[jsdocs-href]: https://www.jsdocs.io/package/eslint-plugin-pnpm-catalog
