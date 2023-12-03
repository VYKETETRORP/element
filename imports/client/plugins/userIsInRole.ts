import { Meteor } from 'meteor/meteor'
import { Session } from 'meteor/session'
import { App } from 'vue'
import { isString, isArray, intersection } from 'lodash'

export default {
  install(app: App) {
    app.config.globalProperties.$userIsInRole = userIsInRole
    app.provide(`$userIsInRole`, userIsInRole)
  },
}

const userIsInRole = (roles: string | string[]) => {
  const currentUser = Meteor.user() || Session.get('currentUser')
  const currentUserRoles: string[] = currentUser?.profile?.roles || []

  let userRoles = ['super']
  if (isString(roles)) {
    userRoles.push(roles)
  } else if (isArray(roles)) {
    userRoles = userRoles.concat(roles)
  }

  return !!intersection(currentUserRoles, userRoles).length
}
