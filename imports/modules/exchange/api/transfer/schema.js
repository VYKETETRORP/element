import SimpleSchema from 'simpl-schema'

export const transferSchema = new SimpleSchema({
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
  fromEmployeeId: {
    type: String,
  },
  toEmployeeId: {
    type: String,
  },
  branchId: {
    type: String,
  },
})

export const transferDetailSchema = new SimpleSchema({
  currencyId: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
  },
})
