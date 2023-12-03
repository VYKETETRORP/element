import SimpleSchema from 'simpl-schema'

export const rateSchema = new SimpleSchema({
  _id: {
    type: String,
    optional: true,
  },
  tranDate: {
    type: Date,
  },
  providerId: {
    type: String,
  },
  branchId: {
    type: String,
  },
})

export const detailSchema = new SimpleSchema({
  // exchangeCurrencyId:{
  //   type:String,
  //   required:true
  // },
  exchangeRateId: {
    type: String,
    required: true,
  },
  baseExchangeCurrencyId: {
    type: String,
    required: true,
  },
  toExchangeCurrencyId: {
    type: String,
    required: true,
  },
  // rate: {
  //   type: Number,
  // },
  bid: {
    type: Number,
  },
  ask: {
    type: Number,
  },
  status: {
    type: String,
  },
})
