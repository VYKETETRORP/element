import { createRouter, createWebHistory } from "vue-router";

//------ Module -----
import app from "./client/routes";
// // Reference : https://github.com/vuejs/vue-router/issues/2881
// const originalPush = VueRouter.prototype.push
// VueRouter.prototype.push = function push(location, onResolve, onReject) {
//   if (onResolve || onReject) return originalPush.call(this, location, onResolve, onReject)
//   return originalPush.call(this, location).catch(err => err)
// }
const router = createRouter({
  routes: app,
  // routes: app,
  history: createWebHistory(),
});

export default router;
