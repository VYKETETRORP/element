const routes = [
  // Not Found
  {
    path: "/:catchAll(.*)",
    name: "NotFound",
    component: () => import("./pages/NotFound.vue"),
    meta: {
      title: "Not Found",
      noCache: true,
    },
  },
  //  // Dashboard
  //  {
  //    path: "/",
  //    name: "Dashboard",
  //    component: () => import("./pages/Dashboard.vue"),
  //    meta: {
  //      title: "Dashboard",
  //      icon: "fas fa-tachometer-alt",
  //      noCache: true,
  //      affix: true,
  //    },
  //  },
];

export default routes;
