import { App as Application } from 'vue'
// Vue Router
import router from './router'
// Vuex store
//import { store, key } from './store'
// Apollo graphql
// import { apolloProvider } from './apollo-client'
// Create VueI18n instance with options
import i18n from './i18n'
// Progress Bar
import VueProgressBar from '@aacassandra/vue3-progressbar'
// Element Plus
//import '/imports/client/styles/el-theme.scss' // recommend import style first
//import '/imports/client/styles/tailwind.css'
import ElementPlus, {
  ElMessageBox,
  ElNotification,
  ElMessage,
  ElLoading,
} from 'element-plus'
//import ElementIcons from './client/plugins/elementIcons'

// Local plugins
//import ModuleIsInRolePlugin from '/imports/client/plugins/moduleIsInRole'
//import UserIsInRolePlugin from '/imports/client/plugins/userIsInRole'
// Local Filter
//import LocalFilters from '/imports/client/plugins/filters'
//import SubmitButton from '/imports/client/components/SubmitButton.vue'
//import SubmitButton from '/imports/client/components/SubmitButton.vue'
//import SubmitDropdown from '/imports/client/components/SubmitDropdown.vue'
//import InputMask from '/imports/client/plugins/input-mask'
//import InputNumber from '/imports/client/components/InputNumber.vue'
// Vue Touch Events (USE FOR SCROLL)
import VueTouchEvents from 'vue3-touch-events'
// Vue meta
//import { createMetaManager, plugin as MetaPlugin } from 'vue-meta'
//const MetaManager = createMetaManager()

/**
 * Register plugins, components, directive globally
 **/
export default (app: Application) => {
    //  app.use(store, key)
    //  app.use(ElementIcons)
  app.use(router)
  app.use(ElementPlus, { size: 'default' })
  app.use(ElLoading)
  app.use(i18n)
  // app.use(apolloProvider)
  app.use(VueProgressBar, {
    color: '#409eff',
    failedColor: '#f56c6c',
    thickness: '2px',
    transition: {
      speed: '0.2s',
      opacity: '0.6s',
      termination: 300,
    },
    autoRevert: true,
    location: 'top',
    inverse: false,
  })
  app.use(VueTouchEvents)
//  app.use(MetaManager)
//  app.use(MetaPlugin)
  // Some directives & prototypes below will be accessible global
  app.config.globalProperties.$msgbox = ElMessageBox
  app.config.globalProperties.$alert = ElMessageBox.alert
  app.config.globalProperties.$confirm = ElMessageBox.confirm
  app.config.globalProperties.$prompt = ElMessageBox.prompt
  app.config.globalProperties.$notify = ElNotification
  app.config.globalProperties.$message = ElMessage

  /**
   * Local Plugin
//   */
//  app.use(ModuleIsInRolePlugin)
//  app.use(UserIsInRolePlugin)
//  app.use(LocalFilters)
//  app.use(InputMask)

//  // Global components
//  app.component(InputNumber.name, InputNumber)
//  app.component(SubmitButton.name, SubmitButton)
//  app.component(SubmitDropdown.name, SubmitDropdown)
}
