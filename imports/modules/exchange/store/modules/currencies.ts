import { Meteor } from 'meteor/meteor'

export default {
  namespace: true,
  state: {
    currencies: [],
  },
  getters: {
    currencies: (state: any) => state.currencies,
  },
  mutations: {
    SET_CURRENCIES(state: any, value: any) {
      state.currencies = value
    },
  },
  actions: {
    getCurrencies({ commit }: any) {
      return new Promise((resolve, reject) => {
        Meteor.apply(
          'ex.fetchExchangeCurrency',
          [{}],
          {},
          (err: any, res: any) => {
            if (err) {
              reject(err)
            } else {
              res = res.sort((it: any, el: any) => it.order - el.order)
              commit('SET_CURRENCIES', res)
              resolve(res)
            }
          }
        )
      })
    },
  },
}
