import state from './state'
import getters from './getters'
import mutations from './mutations'
import actions from './actions'

// Modules
import moduleA from './modules/moduleA'
import moduleB from './modules/moduleB'

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
  modules: {
    moduleA,
    moduleB,
  },
}
