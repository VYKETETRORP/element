import { createI18n } from 'vue-i18n'

// Element UI
import enLocale from 'element-plus/lib/locale/lang/en'
import kmLocale from 'element-plus/lib/locale/lang/km'

// Lang
import enApp from '/imports/client/lang/en'
import kmApp from '/imports/client/lang/km'
import enSidebarApp from '/imports/client/lang/sidebar-en'
import kmSidebarApp from '/imports/client/lang/sidebar-km'
import enReportApp from '/imports/client/lang/report-en'
import kmReportApp from '/imports/client/lang/report-km'
import enBreadcrumbApp from '/imports/client/lang/breadcrumb-en'
import kmBreadcrumbApp from '/imports/client/lang/breadcrumb-km'
// Sample
import enSample from '/imports/modules/sample/client/lang/en'
import kmSample from '/imports/modules/sample/client/lang/km'
import enSidebarSample from '/imports/modules/sample/client/lang/sidebar-en'
import kmSidebarSample from '/imports/modules/sample/client/lang/sidebar-km'

// Exchange
import enExchange from '/imports/modules/exchange/lang/en'
import khExchange from '/imports/modules/exchange/lang/km'
import enSideBarExchange from '/imports/modules/exchange/lang/sidebar-en'
import khSideBarExchange from '/imports/modules/exchange/lang/sidebar-km'
import enReportExchange from '/imports/modules/exchange/lang/report-en'
import kmReportExchange from '/imports/modules/exchange/lang/report-km'
import enBreadcrumbExchange from '/imports/modules/exchange/lang/breadcrumb-en'
import kmBreadcrumbExchange from '/imports/modules/exchange/lang/breadcrumb-km'

const messages = {
  en: {
    message: 'hello',
    ...enLocale,
    app: enApp,
    exchange: enExchange,
    sample: enSample,
    sidebar: { ...enSidebarApp, ...enSideBarExchange },
    report: { ...enReportApp, ...enReportExchange },
    breadcrumb: { ...enBreadcrumbApp, ...enBreadcrumbExchange },
  },
  km: {
    message: 'សួស្តី',
    ...kmLocale,
    app: kmApp,
    exchange: khExchange,
    sample: kmSample,
    sidebar: { ...kmSidebarApp, ...khSideBarExchange },
    report: { ...kmReportApp, ...kmReportExchange },
    breadcrumb: { ...kmBreadcrumbApp, ...kmBreadcrumbExchange },
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
