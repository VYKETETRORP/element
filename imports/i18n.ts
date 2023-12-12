import { createI18n } from 'vue-i18n'

//// Element UI
//import enLocale from 'element-plus/lib/locale/lang/en'
//import kmLocale from 'element-plus/lib/locale/lang/km'

// Lang
import enApp from '/imports/client/lang/en'
import kmApp from '/imports/client/lang/km'
import enSidebarApp from '/imports/client/lang/sidebar-en'
import kmSidebarApp from '/imports/client/lang/sidebar-km'
import enReportApp from '/imports/client/lang/report-en'
import kmReportApp from '/imports/client/lang/report-km'
import enBreadcrumbApp from '/imports/client/lang/breadcrumb-en'
import kmBreadcrumbApp from '/imports/client/lang/breadcrumb-km'

const messages = {
  en: {
    message: 'hello',
    //...enLocale,
    app: enApp,
    sidebar: { ...enSidebarApp },
    report: { ...enReportApp },
    breadcrumb: { ...enBreadcrumbApp },
  },
  km: {
    message: 'សួស្តី',
    //...kmLocale,
    app: kmApp,
    sidebar: { ...kmSidebarApp },
    report: { ...kmReportApp },
    breadcrumb: { ...kmBreadcrumbApp },
  },
}
// Create VueI18n instance with options
const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: 'en',
  fallbackLocale: 'en',
  messages,
})

export default i18n
