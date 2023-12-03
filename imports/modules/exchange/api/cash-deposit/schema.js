import SimpleSchema from 'simpl-schema'

export const cashDepositSchema = new SimpleSchema({
  _id: {
    type: String,
    optional: true,
  },
  // refNo: {
  //   type: String,
  // },
  tranType: {
    type: String,
  },
  tranDate: {
    type: Date,
  },
  employeeId: {
    type: String,
  },
  fromEmployeeId: {
    type: String,
    optional: true,
  },
  branchId: {
    type: String,
  },
})

export const cashDepositDetailSchema = new SimpleSchema({
  currencyId: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
  },
})
