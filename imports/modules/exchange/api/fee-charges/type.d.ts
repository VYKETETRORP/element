declare global {
  namespace FeeCharge {
    type Schema = {
      _id: string
      tranDate: Date
      tranType: 'In' | 'Out'
      feeType: 'OwnFee' | 'BrokerFee'
      branchId: string
    }

    type Input = Omit<Schema, '_id'>
  }

  namespace FeeChargeDetails {
    type Schema = {
      _id: string
      parentId: string
      currencyId: string
      amount: number
      rateType: string
      value: number
      branchId: string
    }

    type Input = Omit<Schema, '_id' | 'parentId' | 'branchId'>
  }
}

export {}
