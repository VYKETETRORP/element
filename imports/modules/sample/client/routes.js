const prefix = '/sample'
const routes = [
  /**
   * Setting
   */
  {
    path: '/setting/:active?',
    name: 'DemoSetting',
    component: () => import('./pages/Setting.vue'),
    meta: {
      title: 'Setting',
      noCache: true,
      breadcrumb: {
        parent: 'Dashboard',
      },
    },
  },
  /**
   * Pos Center
   */
  {
    path: '/sample-demo',
    name: 'SampleDemo',
    component: () => import('./pages/Demo.vue'),
    meta: {
      title: 'Sample Demo',
      noCache: true,
      breadcrumb: {
        parent: 'Dashboard',
      },
    },
  },
  {
    path: '/post-center',
    name: 'DemoPostCenter',
    component: () => import('./pages/PostCenter.vue'),
    meta: {
      title: 'Post Center',
      noCache: true,
      breadcrumb: {
        parent: 'Dashboard',
      },
    },
  },
  // Post
  {
    path: '/post',
    name: 'DemoPost',
    component: () => import('./pages/Post.vue'),
    meta: {
      title: 'Post',
      linkActive: 'DemoPostCenter',
      breadcrumb: {
        parent: 'DemoPostCenter',
      },
    },
  },
  /**
   * Report
   */
  // Sample
  {
    path: '/report-sample',
    name: 'DemoSampleReport',
    component: () => import('./reports/Sample.vue'),
    meta: {
      title: 'Sample Report',
      breadcrumb: {
        parent: 'Dashboard',
      },
    },
  },
  // Post
  {
    path: '/report-post',
    name: 'DemoPostReport',
    component: () => import('./reports/Post.vue'),
    meta: {
      title: 'Post Report',
      breadcrumb: {
        parent: 'Dashboard',
      },
    },
  },
].map((route) => {
  route.path = prefix + route.path
  return route
})

export default routes
