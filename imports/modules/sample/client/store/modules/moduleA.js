export default {
  namespaced: true,
  state: {
    count: 0,
  },
  getters: {},
  mutations: {
    INCREASE_COUNT(state, val) {
      state.count += val
    },
  },
  actions: {
    increaseCount({ commit }, val) {
      commit('INCREASE_COUNT', val)
    },
  },
}
