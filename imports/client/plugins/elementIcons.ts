import { App } from 'vue'
import Icons from '@element-plus/icons-vue'

export default {
  install(app: App) {
    if (typeof Icons !== 'object') return

    // Loop register icon component globally
    for (const [key, value] of Object.entries(Icons)) {
      app.component(key, value)
    }
  },
}
