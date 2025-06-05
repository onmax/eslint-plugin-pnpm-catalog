import jsonEnforceCatalogedDependencies from './json-enforce-cataloged-dependencies'
import jsonEnforceNamedCatalogs from './json-enforce-named-catalogs'

export const rules = {
  'json-enforce-named-catalogs': jsonEnforceNamedCatalogs,
  'json-enforce-cataloged-dependencies': jsonEnforceCatalogedDependencies,
}
