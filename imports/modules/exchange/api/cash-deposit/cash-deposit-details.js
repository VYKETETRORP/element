import Mongoose from 'mongoose'
const SchemaTypes = Mongoose.Schema.Types

const Schema = new Mongoose.Schema({
  _id: String,
  cashId: {
    type: String,
    required: true,
  },
  currencyId: {
    type: String,
    required: true,
  },
  tranDate: {
    type: Date,
    required: true,
  },
  amount: {
    // Decimal number
    type: SchemaTypes.Decimal128,
    required: true,
  },
  branchId: {
    type: String,
    index: true,
    required: true,
  },
})

export default Mongoose.model(
  'ex_cashDepositDetails',
  Schema,
  'ex_cashDepositDetails'
)
