// actions
export default {
  addProductToCart({ state, commit }, product) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        commit('pushProductToCart', { name: product.name })
        resolve()
      }, 1000)
    })
  },
}
