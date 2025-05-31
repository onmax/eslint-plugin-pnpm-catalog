export const DEPS_FIELDS = [
  'dependencies',
  'devDependencies',
  'peerDependencies',
  'optionalDependencies',
  'packageManager',
  'pnpm.overrides',
  'resolutions',
  'overrides',
  'pnpm-workspace',
] as const

export type DepType = (typeof DEPS_FIELDS)[number]

export interface CatalogRule {
  name: string
  match: string | RegExp | (string | RegExp)[]
  depFields?: DepType[]
  priority?: number
}

const DEP_TYPE_GROUP_NAME_MAP: Partial<Record<DepType, string>> = {
  dependencies: 'prod',
  devDependencies: 'dev',
  peerDependencies: 'peer',
  optionalDependencies: 'optional',
}

export interface RawDep {
  name: string
  version: string
  source: DepType
}

// List originally from https://github.com/jinghaihan/pncat
const DEFAULT_CATALOG_RULES: CatalogRule[] = [
  {
    name: 'types',
    match: [/@types/],
    // depFields: ['devDependencies'],
    priority: 10,
  },
  {
    name: 'monorepo',
    match: [/lerna/, /changesets/, /nx/, /turbo/, /shadcn-vue/],
    priority: 20,
  },
  {
    name: 'test',
    match: [
      /vitest/,
      /jest/,
      /mocha/,
      /cypress/,
      /playwright/,
      /@vue\/test-utils/,
    ],
    priority: 20,
  },
  {
    name: 'lint',
    match: [
      /eslint/,
      /prettier/,
      /stylelint/,
      /biome/,
      /commitlint/,
      /lint-staged/,
      /husky/,
      /pre-commit/,
      /simple-git-hooks/,
      /cspell/,
    ],
    priority: 20,
  },
  {
    name: 'cli',
    match: [
      /taze/,
      /bumpp/,
      /commitizen/,
      /cz-git/,
      /czg/,
      /release-it/,
      /standard-version/,
      /pncat/,
    ],
    priority: 20,
  },
  {
    name: 'i18n',
    match: [/i18n/],
    priority: 30,
  },
  {
    name: 'node',
    match: [
      /cross-env/,
      /dotenv/,
      /pathe/,
      /enhanced-resolve/,
      /fs-extra/,
      /fast-glob/,
      /globby/,
      /cac/,
      /prompts/,
      /execa/,
      /tinyexec/,
      /rimraf/,
      /find-up/,
      /ora/,
      /chalk/,
      /ansis/,
      /consola/,
      /pkg-types/,
      /local-pkg/,
      /unconfig/,
    ],
    priority: 30,
  },
  {
    name: 'utils',
    match: [
      /lodash/,
      /radash/,
      /dayjs/,
      /zod/,
      /semver/,
      /qs/,
      /nanoid/,
      /magic-string/,
      /deepmerge/,
      /defu/,
      /@vueuse\//,
      /clsx/,
      /class-variance-authority/,
      /dagre/,
      /graphlib/,
    ],
    priority: 30,
  },
  {
    name: 'network',
    match: [/axios/, /fetch-event-source/, /fetch-event-stream/],
    priority: 30,
  },
  {
    name: 'script',
    match: [/tsx/, /jiti/, /esno/],
    priority: 40,
  },
  {
    name: 'build',
    match: [
      /vite/,
      /webpack/,
      /rollup/,
      /rolldown/,
      /esbuild/,
      /unbuild/,
      /tsup/,
      /tsdown/,
      /rspack/,
      /unplugin/,
    ],
    priority: 40,
  },
  {
    name: 'icons',
    match: [/iconify/, /icon/, /lucide/],
    priority: 50,
  },
  {
    name: 'syntax',
    match: [/shiki/, /prismjs/, /highlight\.js/],
    priority: 50,
  },
  {
    name: 'markdown',
    match: [/markdown-it/, /markdown/],
    priority: 50,
  },
  {
    name: 'style',
    match: [
      /postcss/,
      /autoprefixer/,
      /less/,
      /sass/,
      /tailwindcss/,
      /unocss/,
      /windicss/,
      /purgecss/,
      /tailwindcss-animate/,
      /tailwind-merge/,
      /tw-animate-css/,
      /typography/,
    ],
    priority: 50,
  },
  {
    name: 'frontend',
    match: [
      /nprogress/,
      /swiper/,
      /tippy/,
      /monaco-editor/,
      /codemirror/,
      /sortablejs/,
      /draggable/,
      /moveable/,
      /echarts/,
      /d3/,
      /three/,
      /leaflet/,
      /^vue$/,
      /vue-router/,
      /vuex/,
      /pinia/,
      /ant-design/,
      /element-plus/,
      /naive-ui/,
      /vuetify/,
      /radix-vue/,
      /reka-ui/,
      /logicflow/,
      /vue-flow/,
    ],
    priority: 60,
  },
  {
    name: 'backend',
    match: [/express/, /koa/, /drizzle/],
    priority: 70,
  },
]

export function getDepCatalogName({ name, source }: RawDep, customRules: CatalogRule[] = []): string {
  // Process custom rules first (they have higher priority)
  const sortedCustomRules = [...customRules].sort((a, b) => (b.priority || 0) - (a.priority || 0))

  for (const rule of sortedCustomRules) {
    const { name: catalogName, match } = rule

    if (Array.isArray(match)) {
      if (match.some(m => (typeof m === 'string' ? name === m : new RegExp(m).test(name))))
        return catalogName
    }
    else if (typeof match === 'string' && name === match) {
      return catalogName
    }
    else if (new RegExp(match).test(name)) {
      return catalogName
    }
  }

  // Then process default rules
  for (const rule of DEFAULT_CATALOG_RULES ?? []) {
    const { name: catalogName, match } = rule

    if (Array.isArray(match)) {
      if (match.some(m => (typeof m === 'string' ? name === m : m.test(name))))
        return catalogName

      else if (typeof match === 'string' && name === match)
        return catalogName

      else if (match instanceof RegExp && match.test(name))
        return catalogName
    }
  }

  return DEP_TYPE_GROUP_NAME_MAP[source] || 'default'
}
