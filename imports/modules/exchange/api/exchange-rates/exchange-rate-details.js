import Mongoose from 'mongoose'
const SchemaTypes = Mongoose.Schema.Types

const Schema = new Mongoose.Schema(
  {
    _id: String,
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
    //   // Decimal number
    //   type: SchemaTypes.Decimal128,
    //   required: true,
    // },
    bid: {
      // Decimal number
      type: SchemaTypes.Decimal128,
      required: true,
    },
    ask: {
      // Decimal number
      type: SchemaTypes.Decimal128,
      required: true,
    },
    branchId: {
      type: String,
      index: true,
      required: true,
    },
    status: {
      type: String,
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
  'ex_exchangeRateDetails',
  Schema,
  'ex_exchangeRateDetails'
)
