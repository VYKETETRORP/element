const reportMenu = [
  {
    title: 'Exchange',
    icon: 'fas fa-exchange',
    activeGroups: ['General'],
    data: [
      // General
      {
        groupTitle: 'General',
        icon: 'fas fa-print',
        items: [
          {
            title: 'Exchange Transaction',
            route: { name: 'TransactionReport' },
            memo: ``,
            roles: ['exchange-transaction-report'],
          },
          {
            title: 'Exchange Transaction Details By Currencies',
            route: { name: 'TransactionReportDetails' },
            memo: ``,
            roles: ['exchange-transaction-details-report'],
          },
          {
            title: 'Exchange Transaction Summary',
            route: { name: 'TransactionSummaryReport' },
            memo: ``,
            roles: ['exchange-transaction-summary-report'],
          },
          {
            title: 'Exchange Transaction Details By Employees',
            route: { name: 'TransactionEmployeeDetailsReport' },
            memo: ``,
            roles: ['exchange-transaction-employee-details-report'],
          },
          {
            title: 'Money Transfer Details',
            route: { name: 'MoneyTransferReport' },
            memo: ``,
            roles: ['money-transfer-details'],
          },
        ],
      },
      // // Summary
      // {
      //   groupTitle: 'Summary',
      //   icon: 'fas fa-print',
      //   items: [
      //     {
      //       title: 'Transaction',
      //       route: { name: 'TransactionReport' },
      //       memo: ``,
      //     },
      //   ],
      // },
    ],
  },
]

export default reportMenu
