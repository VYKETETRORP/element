export default {
  namespaced: true,
  state: {
    countB: 0,
  },
  getters: {},
  mutations: {
    INCREASE_COUNTB(state, val) {
      state.countB += val
    },
  },
  actions: {
    increaseCountB({ commit }, val) {
      commit('INCREASE_COUNTB', val)
    },
  },
}
