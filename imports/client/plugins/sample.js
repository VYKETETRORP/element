const MyPlugin = {
  install(Vue, options) {
    // 1. add global method or property
    Vue.myGlobalMethod = function () {
      // something logic ...
    }

    // 2. add a global asset
    Vue.directive('my-directive', {
      bind(el, binding, vnode, oldVnode) {
        // something logic ...
      },
      // ...
    })

    // 3. inject some component options
    Vue.mixin({
      created: function () {
        // something logic ...
      },
      // ...
    })

    // 4. add an instance method
    app.config.globalProperties.$myMethod = function (methodOptions) {
      // something logic ...
    }
  },
}

export default MyPlugin
