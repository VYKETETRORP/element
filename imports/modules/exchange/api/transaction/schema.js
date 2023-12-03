import SimpleSchema from 'simpl-schema'

export const transactionSchema = new SimpleSchema({
  _id: {
    type: String,
    optional: true,
  },
  refNo: {
    type: String,
  },
  tranTypeId: {
    type: String,
  },
  tranDate: {
    type: Date,
  },
  customerId: {
    type: String,
  },
  employeeId: {
    type: String,
  },
  memo: {
    type: String,
    optional: true,
  },
  branchId: {
    type: String,
  },
})

export const transactionDetailSchema = new SimpleSchema({
  exchangeRateDetailId: {
    type: String,
    required: true,
  },
  received: {
    type: Number,
    required: true,
  },
  exchangeAmount: {
    type: Number,
  },
  amount: {
    type: Number,
  },
  return: {
    type: Number,
  },
  baseCurrencyId: {
    type: String,
    required: true,
  },
  toCurrencyId: {
    type: String,
    required: true,
  },
  type: {
    type: String,
  },
})
