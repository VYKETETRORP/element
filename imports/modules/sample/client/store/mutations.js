export default {
  pushProductToCart(state, { name }) {
    state.items.push({
      name,
      quantity: 1,
      isSold: false,
    })
  },
}
