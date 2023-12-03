const sidebarMenu = [
  {
    title: 'New Transaction',
    icon: 'fal fa-plus',
    roles: ['transaction-exchange-insert'],
    route: {
      name: 'Transaction',
      params: {
        type: 'new',
      },
    },
  },
  {
    title: 'Customer Center',
    icon: 'fal fa-cog',
    route: { name: 'CustomerCenter' },
    modules: ['exchangeModule'],
    roles: [
      'transaction-exchange-insert',
      'transaction-exchange-update',
      'transaction-exchange-remove',
      'exchange-rate-insert',
      'exchange-rate-update',
      'exchange-rate-remove',
      'transaction-cash-deposit-insert',
      'transaction-cash-deposit-update',
      'transaction-cash-deposit-remove',
      'transaction-transfer-insert',
      'transaction-transfer-update',
      'transaction-transfer-remove',
      'money-transfer-insert',
      'money-transfer-update',
      'money-transfer-remove',
    ],
    children: [
      {
        title: 'Transaction',
        roles: ['transaction-exchange-insert'],
        route: {
          name: 'Transaction',
          params: {
            type: 'new',
          },
        },
      },
      {
        title: 'Exchange Rate',
        roles: ['exchange-rate-insert'],
        route: {
          name: 'ExchangeRate',
          params: {
            type: 'new',
          },
        },
      },
      {
        title: 'CashDeposit',
        roles: ['transaction-cash-deposit-insert'],
        route: {
          name: 'CashDeposit',
        },
      },
      {
        title: 'Transfer',
        roles: ['transaction-transfer-insert'],
        route: {
          name: 'Transfer',
        },
      },
      {
        title: 'Money Transfer',
        roles: ['money-transfer-insert'],
        route: {
          name: 'MoneyTransfer',
        },
      },
    ],
  },
]

export default sidebarMenu
