import { Meteor } from "meteor/meteor";
import { createApp, provide, h, App as Application } from "vue";
// Apollo graphql
// import { DefaultApolloClient } from '@vue/apollo-composable'
// import { apolloClient } from './apollo-client'
// Vue 

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import router from "./router";
// Plugins
import registerPlugins from "./plugins";

// Root component
import AppLayout from "/imports/client/layouts/AppLayout.vue";

//import AppLayout from '/imports/client/layouts/AppLayout.vue'

// hide warning console
globalThis.__VUE_OPTIONS_API__ = true;
globalThis.__VUE_PROD_DEVTOOLS__ = false;

// Create application
const app:Application = createApp({
  render() {
    return h(AppLayout);
  },
});

registerPlugins(app);
app.use(ElementPlus)

app.mount("#app");

/**
 * Navigation Guards
 **/
//router.beforeEach((to, from, next) => {
//  app.config.globalProperties.$Progress.start()

//  if (to.meta.noAuth) {
//    next()
//  } else {
//    if (Meteor.userId()) {
//      if (app.config.globalProperties.$userIsInRole(`super`)) next()
//      else {
//        // Check permission modules
//        if (to.meta && to.meta.modules) {
//          if (app.config.globalProperties.$moduleIsInRole(to.meta.modules)) {
//            next()
//          } else {
//            app.config.globalProperties.$message({
//              type: 'error',
//              showClose: true,
//              message: `You don't have permission to access this page!`,
//            })
//            next({ path: from.fullPath })
//            // loading
//            app.config.globalProperties.$Progress.finish()
//          }
//        } else {
//          next()
//        }
//      }
//    } else {
//      next({ path: '/login' })
//    }
//  }
//})

//router.afterEach(() => {
//  app.config.globalProperties.$Progress.finish()
//})

export default app;
