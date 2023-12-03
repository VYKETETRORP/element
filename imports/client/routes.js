const routes = [
  // Redirect Page for tagView
  {
    path: "/redirect",
    component: () => import("./layouts/MainLayout.vue"),
    hidden: true,
    children: [
      {
        path: "/redirect/:path*",
        component: () => import("./layouts/Redirect.vue"),
      },
    ],
  },
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
  // Login
  //  {
  //    path: "/login",
  //    name: "Login",
  //    component: () => import("./pages/Login.vue"),
  //    meta: {
  //      layout: "login",
  //      title: "Login",
  //      noAuth: true,
  //      noCache: true,
  //      noTagView: true,
  //    },
  //  },
  // Create New Account
  {
    path: "/create-an-account",
    name: "CreateAnAccount",
    component: () => import("./pages/CreateNewAccount.vue"),
    meta: {
      layout: "login",
      title: "Create An Account",
      noAuth: true,
      noCache: true,
    },
  },
  // Recover Password Form
  {
    path: "/forget-password",
    name: "ForgetPassword",
    component: () => import("./pages/ForgetPassword.vue"),
    meta: {
      layout: "login",
      title: "Forget Password",
      noAuth: true,
      noCache: true,
    },
  },
  // Recover Password Form
  {
    path: "/reset-new-password",
    name: "ResetNewPassword",
    component: () => import("./pages/ResetNewPassword.vue"),
    meta: {
      layout: "login",
      title: "Reset New Password",
      noAuth: true,
      noCache: true,
    },
  },
  // Confirm
  {
    path: "/confirm",
    name: "Confirm",
    component: () => import("./pages/Confirm.vue"),
    meta: {
      layout: "login",
      title: "Confirm",
      noCache: true,
    },
  },
  // Dashboard
  {
    path: "/",
    name: "Dashboard",
    component: () => import("./pages/Dashboard.vue"),
    meta: {
      title: "Dashboard",
      icon: "fas fa-tachometer-alt",
      noCache: true,
      affix: true,
    },
  },
  /**
   * Demo Page
   */
  {
    path: "/app-demo",
    name: "Demo",
    component: () => import("./demos/Index.vue"),
    meta: {
      title: "Demo Page",
      noCache: true,
    },
  },
  /**
   * Change log
   */
  {
    path: "/app-change-log",
    name: "Changelog",
    component: () => import("./pages/Changelog.vue"),
    meta: {
      title: "Changelog",
      noCache: true,
    },
  },
  /**
   * Audit Log
   */
  {
    path: "/audit-log",
    name: "AuditLog",
    component: () => import("./pages/AuditLog.vue"),
    meta: {
      title: "Audit Log",
      breadcrumb: {
        parent: "Dashboard",
      },
    },
  },
  /**
   * Admin Setting
   */
  {
    path: "/setting/:active?",
    name: "Setting",
    component: () => import("./pages/Setting.vue"),
    meta: {
      title: "Setting",
      breadcrumb: {
        parent: "Dashboard",
      },
    },
  },
  /**
   * Accounting Center
   */
  {
    path: "/account",
    name: "AccountCenter",
    component: () => import("./pages/AccountCenter.vue"),
    meta: {
      title: "Accounting Center",
      noCache: true,
      breadcrumb: {
        parent: "Dashboard",
      },
    },
  },
  // Account Setting
  // {
  //   path: '/account-setting/:active?',
  //   name: 'AccountSetting',
  //   component: () => import('./pages/AccountSetting.vue'),
  //   meta: {
  //     title: 'Account Setting',
  //     linkActive: 'AccountCenter',
  //     breadcrumb: {
  //       parent: 'Dashboard',
  //     },
  //   },
  // },
  // Chart of Account
  {
    path: "/chart-account/:showId?",
    name: "ChartAccountForm",
    component: () => import("./pages/ChartAccountForm.vue"),
    props: true,
    meta: {
      title: "Chart Account",
      linkActive: "AccountCenter",
      breadcrumb: {
        parent: "Dashboard",
      },
    },
  },
  // Journal
  {
    path: "/journal/:_id?",
    name: "JournalForm",
    component: () => import("./pages/JournalForm.vue"),
    meta: {
      title: "Journal Entry",
      modules: "journal",
      linkActive: "AccountCenter",
      breadcrumb: {
        parent: "AccountCenter",
      },
    },
  },
  /**
   * Cash Center
   */
  // {
  //   path: '/cash',
  //   name: 'CashCenter',
  //   component: () =>
  //     import('./pages/CashCenter.vue'),
  //   meta: {
  //     title: 'Cash Center',
  //     noCache: true,
  //     breadcrumb: {
  //       parent: 'Dashboard',
  //     },
  //   },
  // },
  // Cash Transaction
  {
    path: "/cash-transaction",
    name: "CashTransactionForm",
    component: () => import("./pages/CashTransactionForm.vue"),
    meta: {
      title: "Cash Transaction",
      modules: "cash-transaction",
      linkActive: "AccountCenter",
      breadcrumb: {
        parent: "AccountCenter",
      },
    },
  },
  // Revenue
  {
    path: "/revenue",
    name: "RevenueForm",
    component: () => import("./pages/RevenueForm.vue"),
    meta: {
      title: "Revenue Entry",
      modules: "cash-revenue",
      linkActive: "AccountCenter",
      breadcrumb: {
        parent: "AccountCenter",
      },
    },
  },
  // Expense
  {
    path: "/expense",
    name: "ExpenseForm",
    component: () => import("./pages/ExpenseForm.vue"),
    meta: {
      title: "Expense Entry",
      modules: "cash-expense",
      linkActive: "AccountCenter",
      breadcrumb: {
        parent: "AccountCenter",
      },
    },
  },
  // Recurring list
  {
    path: "/recurring-list",
    name: "JournalRecurring",
    component: () => import("./pages/Recurring.vue"),
    props: (route) => ({ ...route.query }),
    meta: {
      title: "Journal Recurring",
      linkActive: "AccountCenter",
      breadcrumb: {
        parent: "AccountCenter",
      },
    },
  },
  /**
   * Report Center
   */
  {
    path: "/report",
    name: "ReportCenter",
    component: () => import("./reports/Index.vue"),
    meta: {
      title: "Reports",
      breadcrumb: {
        parent: "Dashboard",
      },
    },
  },
  // Account List
  {
    path: "/account-list-rpt",
    name: "AccountListReport",
    component: () => import("./reports/AccountList.vue"),
    meta: {
      title: "Account List Report",
      modules: "account-list-report",
      linkActive: "Report",
      breadcrumb: {
        parent: "Dashboard",
      },
    },
  },
  // Journal
  {
    path: "/journal-rpt",
    name: "JournalReport",
    component: () => import("./reports/Journal.vue"),
    meta: {
      title: "Journal Report",
      modules: "journal-report",
      linkActive: "Report",
      breadcrumb: {
        parent: "Dashboard",
      },
    },
  },
  // General Ledger
  {
    path: "/general-ledger-rpt",
    name: "GeneralLedgerReport",
    component: () => import("./reports/GeneralLedger.vue"),
    meta: {
      title: "General Ledger Report",
      modules: "ledger-report",
      linkActive: "Report",
      breadcrumb: {
        parent: "Dashboard",
      },
    },
  },
  // Cash Transaction
  {
    path: "/cash-transaction-rpt",
    name: "CashTransactionReport",
    component: () => import("./reports/CashTransaction.vue"),
    meta: {
      title: "Cash Transaction Report",
      modules: "cash-report",
      linkActive: "Report",
      breadcrumb: {
        parent: "Dashboard",
      },
    },
  },
  // Trail Balance
  {
    path: "/trial-balance-rpt",
    name: "TrialBalanceReport",
    component: () => import("./reports/TrialBalance.vue"),
    meta: {
      title: "Trial Balance Report",
      modules: "trial-balance-report",
      linkActive: "Report",
      breadcrumb: {
        parent: "Dashboard",
      },
    },
  },
  // Profit and Loss
  {
    path: "/profit-loss-rpt",
    name: "ProfitLossReport",
    component: () => import("./reports/ProfitLoss.vue"),
    meta: {
      title: "Profit And Loss Report",
      modules: "profit-loss-report",
      linkActive: "Report",
      breadcrumb: {
        parent: "Dashboard",
      },
    },
  },
  // Profit and Loss Comparison
  {
    path: "/profit-loss-comparison-rpt",
    name: "ProfitLossComparisonReport",
    component: () => import("./reports/ProfitLossComparison.vue"),
    meta: {
      title: "Profit And Loss Comparison Report",
      modules: "profit-loss-comparison-report",
      linkActive: "Report",
      breadcrumb: {
        parent: "Dashboard",
      },
    },
  },
  // Profit and Loss By Month
  {
    path: "/profit-loss-by-month-rpt",
    name: "ProfitLossByMonthReport",
    component: () => import("./reports/ProfitLossByMonth.vue"),
    meta: {
      title: "Profit And Loss By Month Report",
      modules: "profit-loss-by-month-report",
      linkActive: "Report",
      breadcrumb: {
        parent: "Dashboard",
      },
    },
  },
  // Profit and Loss by Class
  {
    path: "/profit-loss-by-class-rpt",
    name: "ProfitLossByClassReport",
    component: () => import("./reports/ProfitLossByClass.vue"),
    meta: {
      title: "Profit And Loss By Class Report",
      modules: "profit-loss-by-class-report",
      linkActive: "Report",
      breadcrumb: {
        parent: "Dashboard",
      },
    },
  },
  // Balance Sheet
  {
    path: "/balance-sheet-rpt",
    name: "BalanceSheetReport",
    component: () => import("./reports/BalanceSheet.vue"),
    meta: {
      title: "Balance Sheet Report",
      modules: "balance-sheet-report",
      linkActive: "Report",
      breadcrumb: {
        parent: "Dashboard",
      },
    },
  },
  // Balance Sheet2
  {
    path: "/balance-sheet-rpt2",
    name: "BalanceSheetReport2",
    component: () => import("./reports/BalanceSheet2.vue"),
    meta: {
      title: "Balance Sheet Report2",
      modules: "balance-sheet-report",
      linkActive: "Report",
      breadcrumb: {
        parent: "Dashboard",
      },
    },
  },
  // Balance Sheet Comparison
  {
    path: "/balance-sheet-comparison-rpt",
    name: "BalanceSheetComparisonReport",
    component: () => import("./reports/BalanceSheetComparison.vue"),
    meta: {
      title: "Balance Sheet Comparison Report",
      modules: "balance-sheet-comparison-report",
      linkActive: "Report",
      breadcrumb: {
        parent: "Dashboard",
      },
    },
  },
  // Transaction Detail
  {
    path: "/transaction-detail-rpt",
    name: "TransactionDetailReport",
    component: () => import("./reports/TransactionDetail.vue"),
    meta: {
      title: "Transaction Detail Report",
      modules: "transaction-detail-report",
      linkActive: "Report",
      breadcrumb: {
        parent: "Dashboard",
      },
    },
  },

  /**
   * Tool
   */
  {
    path: "/app-tool",
    name: "Tool",
    component: () => import("./tools/index.vue"),
    meta: {
      title: "Tool",
      breadcrumb: {
        parent: "Dashboard",
      },
    },
  },
  {
    path: "/migrate-data",
    name: "MigrateData",
    component: () => import("./tools/migrateJournalToDecimal.vue"),
    meta: {
      title: "Migrate Data",
      breadcrumb: {
        parent: "Dashboard",
      },
    },
  },

  /**
   * FIXED ASSET CENTER
   */
  {
    path: "/fixed-asset",
    name: "AssetCenter",
    component: () => import("./pages/AssetCenter.vue"),
    meta: {
      title: "Fixed Asset Center",
      noCache: true,
      breadcrumb: {
        parent: "Dashboard",
      },
    },
  },
  // FIXED ASSET FORM
  {
    path: "/fixed-asset-form/:id?",
    name: "AssetForm",
    component: () => import("./pages/AssetForm.vue"),
    meta: {
      title: "Fixed Asset Form",
      linkActive: "AssetCenter",
      breadcrumb: {
        parent: "Dashboard",
      },
    },
  },
  // FIXED ASSET TYPE
  {
    path: "/fixed-asset-type/:id?",
    name: "AssetTypeForm",
    component: () => import("./pages/AssetTypeForm.vue"),
    meta: {
      title: "Fixed Asset Type",
      linkActive: "AssetCenter",
      breadcrumb: {
        parent: "Dashboard",
      },
    },
  },
  {
    path: "/end-of-process-fixed-asset",
    name: "EndOfProcessFixedAssetList",
    component: () => import("./pages/EndOfProcessFixedAssetList.vue"),
    meta: {
      title: "End of Process Fixed Asset",
      linkActive: "AssetCenter",
      breadcrumb: {
        parent: "Dashboard",
      },
    },
  },

  // FIXED ASSET SETTING
  {
    path: "/fixed-asset-setting",
    name: "FixedAssetSetting",
    component: () => import("./pages/AssetSetting.vue"),
    meta: {
      title: "Fixed Asset Setting",
      linkActive: "AssetCenter",
      breadcrumb: {
        parent: "Dashboard",
      },
    },
  },
  // FIXED ASSET TRANSFER
  {
    path: "/fixed-asset-transfer/:id?",
    name: "FixedAssetTransferForm",
    component: () => import("./pages/AssetTransferForm.vue"),
    meta: {
      title: "Asset Transfer Form",
      linkActive: "AssetCenter",
      breadcrumb: {
        parent: "Dashboard",
      },
    },
  },
  // FIXED ASSET ACCEPT
  {
    path: "/fixed-asset-transfer-accept/:id?",
    name: "FixedAssetTransferAcceptForm",
    component: () => import("./pages/AssetTransferAcceptForm.vue"),
    meta: {
      title: "Asset Transfer Accept Form",
      linkActive: "AssetCenter",
      breadcrumb: {
        parent: "Dashboard",
      },
    },
  },
  {
    path: "/fixed-asset-rpt",
    name: "FixedAssetReport",
    component: () => import("./reports/FixedAsset.vue"),
    meta: {
      title: "Fixed Asset Report",
      modules: "fixed-asset-report",
      linkActive: "Report",
      breadcrumb: {
        parent: "Dashboard",
      },
    },
  },
];

export default routes;
