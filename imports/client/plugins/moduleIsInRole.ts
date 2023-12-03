import { App } from 'vue'
import { isString, isArray, intersection } from 'lodash'
import { store } from '/imports/store'

export default {
  install(app: App) {
    app.config.globalProperties.$moduleIsInRole = moduleIsInRole
    app.provide(`$moduleIsInRole`, moduleIsInRole)
  },
}

const moduleIsInRole = (modules: string | string[]) => {
  const currentModuleRoles = store.state.app.allowedModules || []

  let moduleRoles = ['super']

  if (isString(modules)) {
    moduleRoles.push(modules)
  } else if (isArray(modules)) {
    moduleRoles = moduleRoles.concat(modules)
  }

  return !!intersection(currentModuleRoles, moduleRoles).length
}
