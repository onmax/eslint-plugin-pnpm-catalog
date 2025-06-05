import type { CatalogRule, DepType, RawDep } from '../utils/rules'
import { createEslintRule } from '../utils/create'
import { iterateDependencies } from '../utils/iterate'
import { getDepCatalogName } from '../utils/rules'
import { getPnpmWorkspace } from '../utils/workspace'

export type ConflictStrategy = 'new-catalog' | 'overrides' | 'error'

export const RULE_NAME = 'json-enforce-cataloged-dependencies'
export type MessageIds = 'expectNamedCatalog'
export type Options = [
  {
    allowedProtocols?: string[]
    autofix?: boolean
    useCategorization?: boolean
    reuseExistingCatalog?: boolean
    conflicts?: ConflictStrategy
    fields?: string[]
    customRules?: CatalogRule[]
  },
]

const DEFAULT_FIELDS = [
  'dependencies',
  'devDependencies',
]

export default createEslintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'layout',
    docs: {
      description: 'Enforce using "catalog:" in `package.json`',
    },
    fixable: 'code',
    schema: [
      {
        type: 'object',
        properties: {
          allowedProtocols: {
            type: 'array',
            description: 'Allowed protocols in specifier to not be converted to catalog',
            items: {
              type: 'string',
            },
          },
          autofix: {
            type: 'boolean',
            description: 'Whether to autofix the linting error',
            default: true,
          },
          conflicts: {
            type: 'string',
            description: 'Strategy to handle conflicts when adding packages to catalogs',
            enum: ['new-catalog', 'overrides', 'error'],
            default: 'new-catalog',
          },
          fields: {
            type: 'array',
            description: 'Fields to check for catalog',
            items: { type: 'string' },
            default: DEFAULT_FIELDS,
          },
          customRules: {
            type: 'array',
            description: 'Custom rules for catalog categorization',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                match: {
                  oneOf: [
                    { type: 'string' },
                    { type: 'array', items: { type: 'string' } },
                  ],
                },
                depFields: {
                  type: 'array',
                  items: { type: 'string' },
                },
                priority: { type: 'number' },
              },
              required: ['name', 'match'],
              additionalProperties: false,
            },
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      expectNamedCatalog: 'Expect to use named catalog instead of plain specifier or generic catalog, got "{{specifier}}" for package "{{packageName}}". It can be moved to catalog `{{targetCatalog}}`.',
    },
  },
  defaultOptions: [{}],
  create(context, [options]) {
    const {
      allowedProtocols = ['workspace', 'link', 'file'],
      autofix = true,
      conflicts = 'new-catalog',
      fields = DEFAULT_FIELDS,
      customRules = [],
    } = options || {}

    for (const { packageName, specifier, property, fieldName } of iterateDependencies(context, fields)) {
      if (/^catalog:.+/.test(specifier))
        continue
      if (allowedProtocols?.some(p => specifier.startsWith(p)))
        continue

      const workspace = getPnpmWorkspace(context.filename)
      if (!workspace)
        return {}

      const rawDep: RawDep = { name: packageName, version: specifier, source: fieldName as DepType }

      const categorizedCatalogName = getDepCatalogName(rawDep, customRules)
      let targetCatalog = (workspace.getPackageCatalogs(packageName)[0] || categorizedCatalogName)
      const resolvedConflicts = workspace.hasSpecifierConflicts(targetCatalog, packageName, specifier)

      let shouldFix = autofix
      if (conflicts === 'error' && resolvedConflicts.conflicts)
        shouldFix = false

      if (conflicts === 'new-catalog' && resolvedConflicts.conflicts)
        targetCatalog = resolvedConflicts.newCatalogName

      context.report({
        node: property.value as any,
        messageId: 'expectNamedCatalog',
        data: { specifier, packageName, targetCatalog },
        fix: shouldFix
          ? (fixer) => {
              workspace.queueChange(() => {
                workspace.setPackageNoConflicts(targetCatalog, packageName, specifier)
              })

              return fixer.replaceText(property.value as any, JSON.stringify(`catalog:${targetCatalog}`))
            }
          : undefined,
      })
    }

    return {}
  },
})
