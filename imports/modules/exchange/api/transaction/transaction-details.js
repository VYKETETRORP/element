import Mongoose from 'mongoose'
const SchemaTypes = Mongoose.Schema.Types

const Schema = new Mongoose.Schema(
  {
    _id: String,
    transactionId: {
      type: String,
      required: true,
    },
    exchangeRateDetailId: {
      type: String,
      required: true,
    },
    tranDate: {
      type: Date,
      required: true,
    },
    received: {
      // Decimal number
      type: SchemaTypes.Decimal128,
      required: true,
    },
    exchangeAmount: {
      // Decimal number
      type: SchemaTypes.Decimal128,
      required: true,
    },
    amount: {
      // Decimal number
      type: SchemaTypes.Decimal128,
      required: true,
    },
    return: {
      type: SchemaTypes.Decimal128,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    baseCurrencyId: {
      type: String,
      required: true,
    },
    toCurrencyId: {
      type: String,
      required: true,
    },
    branchId: {
      type: String,
      index: true,
      required: true,
    },
  }
  // { timestamps: true }
)

// // hook generate _id before insert
// Schema.pre('save', async function (next, Options) {
//   if (this.isNew) {
//     let id = Mongoose.Types.ObjectId()
//     this._id = id.toString()
//   }
// })

export default Mongoose.model(
  'ex_transactionDetails',
  Schema,
  'ex_transactionDetails'
)
