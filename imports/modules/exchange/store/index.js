// State
// import lookup from './modules/lookup'
import prefix from './modules/prefix'
import customTemplate from './modules/custom-template'
import currencies from './modules/currencies'
// import validateForm from './modules/validate-form'
// const pos = {
//   namespaced: true,
//   modules: {
//     info: options,
//     // module B, C...
//   },
// }

// export default pos

export default {
  namespaced: true,
  modules: {
    prefix: prefix,
    currencies,
    customTemplate: customTemplate,
  },
}
