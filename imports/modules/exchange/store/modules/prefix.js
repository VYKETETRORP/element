/**
 * ================Abbreviation==================
 * https://www.allacronyms.com/receipt/abbreviated
 */
let prefixs = {
  Exchange_Transaction: 'ET',
  Money_Transfer: 'MT',
}
import { split } from 'lodash'

export default {
  namespaced: true,
  state: {
    prefix: '',
  },
  getters: {},
  mutations: {
    GET_REF_PREFIX(state, value) {
      return (state.prefix = value ? value : '')
    },
  },
  actions: {
    getRefPrefix({ commit }, type) {
      return new Promise((resolve, reject) => {
        let prefix = prefixs[type]
        commit('GET_REF_PREFIX', prefix)
        resolve(prefix)
      })
    },
    setPrefix(context, { value, prefix }) {
      let val = `${prefix}${value}`
      return val
    },
    refPrefix(context, { value, types }) {
      return new Promise((resolve, reject) => {
        // let breakWord
        split(types, '|').forEach((it) => {
          value = value.replaceFirst(`${prefixs[it]}`, '')
        })

        resolve(value)
      })
    },
  },
}
