const prefix = '/exchange'
const routes = [
  {
    path: '/customer-center',
    name: 'CustomerCenter',
    component: () => import('./pages/CustomerCenter.vue'),
    meta: {
      title: 'Customer Center',
      noCache: true,
      breadcrumb: {
        parent: 'Dashboard',
      },
    },
  },
  {
    path: '/transaction/:type/:id?',
    name: 'Transaction',
    props: true,
    component: () => import('./pages/TransactionForm.vue'),
    meta: {
      routerView: true,
      title: 'Transaction',
      // noCache: true,
      linkActive: 'CustomerCenter',
      breadcrumb: {
        parent: 'Dashboard',
      },
    },
  },
  {
    path: '/exchange-rate',
    name: 'ExchangeRate',
    component: () => import('./pages/ExchangeRate.vue'),
    meta: {
      title: 'Exchange Rate',
      linkActive: 'CustomerCenter',
      // noCache: true,
      breadcrumb: {
        parent: 'Dashboard',
      },
    },
  },
  //exchange Rate Form
  {
    path: '/exchange-rate-form/:type/:id?',
    name: 'ExchangeRateForm',
    component: () => import('./pages/ExchangeRateForm.vue'),
    props: true,
    meta: {
      routerView: true,
      title: 'Exchange Rate Form',
      linkActive: 'CustomerCenter',
      // noCache: true,
      breadcrumb: {
        parent: 'Dashboard',
      },
    },
  },

  // // Customer Setting
  // {
  //   path: '/customer-setting',
  //   name: 'Setting',
  //   component: () => import('./pages/CustomerSetting.vue'),
  //   meta: {
  //     title: 'Setting',
  //     linkActive: 'CustomerCenter',
  //     breadcrumb: {
  //       parent: 'CustomerCenter',
  //     },
  //   },
  // },
  // Cash Deposit
  {
    path: '/cash-deposit',
    name: 'CashDeposit',
    component: () => import('./pages/CashDeposit.vue'),
    meta: {
      title: 'CashDeposit',
      linkActive: 'CustomerCenter',
      breadcrumb: {
        parent: 'CustomerCenter',
      },
    },
  },
  //exchange Rate Form
  {
    path: '/cash-deposit-form/:type/:id?',
    name: 'CashDepositForm',
    component: () => import('./pages/CashDepositForm.vue'),
    props: true,
    meta: {
      routerView: true,
      title: 'Cash Deposit Form',
      linkActive: 'CustomerCenter',
      // noCache: true,
      breadcrumb: {
        parent: 'Dashboard',
      },
    },
  },
  // Transfer
  {
    path: '/transfer',
    name: 'Transfer',
    component: () => import('./pages/Transfer.vue'),
    meta: {
      title: 'Transfer',
      linkActive: 'CustomerCenter',
      breadcrumb: {
        parent: 'CustomerCenter',
      },
    },
  },
  {
    path: '/transfer-form/:type/:id?',
    name: 'TransferForm',
    component: () => import('./pages/TransferForm.vue'),
    props: true,
    meta: {
      routerView: true,
      title: 'Transfer Form',
      linkActive: 'CustomerCenter',
      // noCache: true,
      breadcrumb: {
        parent: 'Dashboard',
      },
    },
  },
  // Money Transfer
  {
    path: '/money-transfer',
    name: 'MoneyTransfer',
    component: () => import('./pages/MoneyTransfers.vue'),
    meta: {
      title: 'Money Transfer',
      linkActive: 'CustomerCenter',
      breadcrumb: {
        parent: 'CustomerCenter',
      },
    },
  },
  // Transaction Reports
  {
    path: '/transaction-reports',
    name: 'TransactionReport',
    component: () => import('./reports/Transaction.vue'),
    meta: {
      title: 'Transaction Report',
      noCache: false,
      breadcrumb: {
        parent: 'Dashboard',
      },
    },
  },
  {
    path: '/transaction-reports-detail',
    name: 'TransactionReportDetails',
    component: () => import('./reports/TransactionDetailsByCurrency.vue'),
    meta: {
      title: 'Transaction Report Details',
      noCache: false,
      breadcrumb: {
        parent: 'Dashboard',
      },
    },
  },
  {
    path: '/transaction-summary-reports',
    name: 'TransactionSummaryReport',
    component: () => import('./reports/SummaryTransaction.vue'),
    meta: {
      title: 'Transaction Summary Report',
      noCache: false,
      breadcrumb: {
        parent: 'Dashboard',
      },
    },
  },
  {
    path: '/transaction-employee-details-reports',
    name: 'TransactionEmployeeDetailsReport',
    component: () => import('./reports/TransactionEmployeeDetails.vue'),
    meta: {
      title: 'Transaction Employees Details',
      noCache: false,
      breadcrumb: {
        parent: 'Dashboard',
      },
    },
  },
  // Money Transfer
  {
    path: '/money-transfer-report',
    name: 'MoneyTransferReport',
    component: () => import('./reports/MoneyTransferDetails.vue'),
    meta: {
      title: 'Money Transfer Report',
      noCache: false,
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
