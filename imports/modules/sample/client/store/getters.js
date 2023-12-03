export default {
  itemsSold: (state, getters, rootState) => {
    return state.items.filter(it => {
      return it.isSold
    })
  },
}
