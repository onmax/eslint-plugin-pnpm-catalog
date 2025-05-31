import type { InvalidTestCase, ValidTestCase } from 'eslint-vitest-rule-tester'
import { expect } from 'vitest'
import { getMockedWorkspace, runJson } from '../utils/_test'
import rule, { RULE_NAME } from './json-enforce-named-catalogs'

const valids: ValidTestCase[] = [
  {
    filename: 'package.json',
    code: JSON.stringify({
      dependencies: {
        react: 'catalog:frontend',
      },
      devDependencies: {
        'react-dom': 'catalog:frontend',
      },
    }, null, 2),
  },
]

const invalids: InvalidTestCase[] = [
  {
    filename: 'package.json',
    code: JSON.stringify({
      dependencies: {
        'react-dom': '^18.2.0',
        'react': 'catalog:prod',
      },
      devDependencies: {
        'react-native': '^0.74.0',
      },
    }, null, 2),
    errors: [
      { messageId: 'expectNamedCatalog' },
      { messageId: 'expectNamedCatalog' },
    ],
    async output(value) {
      expect(value)
        .toMatchInlineSnapshot(`
          "{
            "dependencies": {
              "react-dom": "catalog:prod",
              "react": "catalog:prod"
            },
            "devDependencies": {
              "react-native": "catalog:dev"
            }
          }"
        `)

      const workspace = getMockedWorkspace()
      expect(workspace.toString())
        .toMatchInlineSnapshot(`
          "catalogs:
            prod:
              react-dom: ^18.2.0
            dev:
              react-native: ^0.74.0
          "
        `)
    },
  },
  {
    description: 'Version conflicts with new catalog',
    filename: 'package.json',
    code: JSON.stringify({
      dependencies: {
        react: '^18.2.0',
      },
      devDependencies: {
        'react-native': '^5.0.0',
      },
    }, null, 2),
    errors: [
      { messageId: 'expectNamedCatalog' },
      { messageId: 'expectNamedCatalog' },
    ],
    async before() {
      const workspace = getMockedWorkspace()
      workspace.setContent(`
        catalogs:
          frontend:
            react: ^18.2.0
            react-native: ^0.74.0
      `)
    },
    async output(value) {
      expect(value)
        .toMatchInlineSnapshot(`
          "{
            "dependencies": {
              "react": "catalog:frontend"
            },
            "devDependencies": {
              "react-native": "catalog:conflicts_frontend_h5_0_0"
            }
          }"
        `)

      const workspace = getMockedWorkspace()
      expect(workspace.toString())
        .toMatchInlineSnapshot(`
          "catalogs:
            frontend:
              react: ^18.2.0
              react-native: ^0.74.0
            conflicts_frontend_h5_0_0:
              react-native: ^5.0.0
          "
        `)
    },
  },
  {
    description: 'Version conflicts with overrides',
    filename: 'package.json',
    code: JSON.stringify({
      dependencies: {
        react: '^18.2.0',
      },
      devDependencies: {
        'react-native': '^5.0.0',
      },
    }, null, 2),
    options: [
      {
        conflicts: 'overrides',
      },
    ],
    errors: [
      { messageId: 'expectNamedCatalog' },
      { messageId: 'expectNamedCatalog' },
    ],
    async before() {
      const workspace = getMockedWorkspace()
      workspace.setContent(`
        catalogs:
          frontend:
            react: ^18.2.0
            react-native: ^0.74.0
      `)
    },
    async output(value) {
      expect(value)
        .toMatchInlineSnapshot(`
          "{
            "dependencies": {
              "react": "catalog:frontend"
            },
            "devDependencies": {
              "react-native": "catalog:frontend"
            }
          }"
        `)

      const workspace = getMockedWorkspace()
      expect(workspace.toString())
        .toMatchInlineSnapshot(`
          "catalogs:
            frontend:
              react: ^18.2.0
              react-native: ^0.74.0
            conflicts_frontend_h5_0_0:
              react-native: ^5.0.0
          "
        `)
    },
  },
  {
    description: 'Custom rules',
    filename: 'package.json',
    code: JSON.stringify({
      dependencies: {
        'my-custom-lib': '^1.0.0',
        'my-ui-component': '^2.0.0',
        'react': '^18.2.0',
      },
      devDependencies: {
        'my-dev-tool': '^3.0.0',
      },
    }, null, 2),
    options: [
      {
        customRules: [
          {
            name: 'custom-ui',
            match: ['my-ui-component', 'my-custom-lib'],
            priority: 100,
          },
          {
            name: 'dev-tools',
            match: 'my-dev-tool',
            priority: 90,
          },
        ],
      },
    ],
    errors: [
      { messageId: 'expectNamedCatalog' },
      { messageId: 'expectNamedCatalog' },
      { messageId: 'expectNamedCatalog' },
      { messageId: 'expectNamedCatalog' },
    ],
    async output(value) {
      expect(value)
        .toMatchInlineSnapshot(`
          "{
            "dependencies": {
              "my-custom-lib": "catalog:custom-ui",
              "my-ui-component": "catalog:custom-ui",
              "react": "catalog:frontend"
            },
            "devDependencies": {
              "my-dev-tool": "catalog:dev-tools"
            }
          }"
        `)

      const workspace = getMockedWorkspace()
      expect(workspace.toString())
        .toMatchInlineSnapshot(`
          "catalogs:
            frontend:
              react: ^18.2.0
              react-native: ^0.74.0
            conflicts_frontend_h5_0_0:
              react-native: ^5.0.0
            custom-ui:
              my-custom-lib: ^1.0.0
              my-ui-component: ^2.0.0
            dev-tools:
              my-dev-tool: ^3.0.0
          "
        `)
    },
  },
  {
    description: 'Custom rules with regex patterns',
    filename: 'package.json',
    code: JSON.stringify({
      dependencies: {
        '@my-org/lib-one': '^1.0.0',
        '@my-org/lib-two': '^2.0.0',
        'external-lib': '^3.0.0',
      },
    }, null, 2),
    options: [
      {
        customRules: [
          {
            name: 'my-org',
            match: '^@my-org/',
            priority: 100,
          },
        ],
      },
    ],
    errors: [
      { messageId: 'expectNamedCatalog' },
      { messageId: 'expectNamedCatalog' },
      { messageId: 'expectNamedCatalog' },
    ],
    async output(value) {
      expect(value)
        .toMatchInlineSnapshot(`
          "{
            "dependencies": {
              "@my-org/lib-one": "catalog:my-org",
              "@my-org/lib-two": "catalog:my-org",
              "external-lib": "catalog:prod"
            }
          }"
        `)

      const workspace = getMockedWorkspace()
      expect(workspace.toString())
        .toMatchInlineSnapshot(`
          "catalogs:
            frontend:
              react: ^18.2.0
              react-native: ^0.74.0
            conflicts_frontend_h5_0_0:
              react-native: ^5.0.0
            custom-ui:
              my-custom-lib: ^1.0.0
              my-ui-component: ^2.0.0
            dev-tools:
              my-dev-tool: ^3.0.0
            my-org:
              '@my-org/lib-one': ^1.0.0
              '@my-org/lib-two': ^2.0.0
            prod:
              external-lib: ^3.0.0
          "
        `)
    },
  },
]

runJson({
  name: RULE_NAME,
  rule,
  valid: valids,
  invalid: invalids,
})
