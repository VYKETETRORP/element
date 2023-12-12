import { Meteor } from "meteor/meteor";

//------ Module -----
import appSidebarMenu from "/imports/client/sidebarMenu";
import appReportMenu from "/imports/client/reportMenu";
import appToolMenu from "/imports/client/toolMenu";

let sidebarMenu = [];
let reportMenu = [];
let toolMenu = [];

// Dev mode
// if (Meteor.isDevelopment) {
//   sidebarMenu = sidebarMenu.concat(sampleSidebarMenu)
//   reportMenu = reportMenu.concat(sampleReportMenu)
// }
sidebarMenu = sidebarMenu.concat(appSidebarMenu);
reportMenu = reportMenu.concat(appReportMenu);
toolMenu = toolMenu.concat(appToolMenu);

export { sidebarMenu, reportMenu, toolMenu };
