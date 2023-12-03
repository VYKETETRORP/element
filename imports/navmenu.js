import { Meteor } from 'meteor/meteor'

//------ Module -----
import appSidebarMenu from '/imports/client/sidebarMenu'
import appReportMenu from '/imports/client/reportMenu'
import appToolMenu from '/imports/client/toolMenu'
// import sampleSidebarMenu from '/imports/modules/sample/client/sidebarMenu'
// import sampleReportMenu from '/imports/modules/sample/client/reportMenu'
import exchangeSidebarMenu from '/imports/modules/exchange/sidebarMenu'
import exchangeReportMenu from '/imports/modules/exchange/reportMenu'

let sidebarMenu = []
let reportMenu = []
let toolMenu = []

// Dev mode
// if (Meteor.isDevelopment) {
//   sidebarMenu = sidebarMenu.concat(sampleSidebarMenu)
//   reportMenu = reportMenu.concat(sampleReportMenu)
// }
sidebarMenu = sidebarMenu.concat(exchangeSidebarMenu, appSidebarMenu)
reportMenu = reportMenu.concat(exchangeReportMenu, appReportMenu)
toolMenu = toolMenu.concat(appToolMenu)

export { sidebarMenu, reportMenu, toolMenu }
