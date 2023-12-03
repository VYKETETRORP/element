declare global {
  namespace MoneyTransfer {
    type Schema = {
      _id: string
      refNo: string
      tranDate: Date
      transferDate: Date
      customerId: string
      employeeId: string
      tranType: 'In' | 'Out'
      currencyId: string
      amount: number
      fee: number
      brokerFee: number
      memo?: string
      branchId: string
    }

    type InsertMoneyTransferInput = Omit<Schema, '_id'>
    type UpdateMoneyTransferInput = Schema
  }
}

export {}
