import Mongoose from 'mongoose'

const Schema = new Mongoose.Schema({
  _id: String,
  providerId: {
    type: String,
    required: true,
  },
  tranDate: {
    type: Date,
    required: true,
  },
  branchId: {
    type: String,
    required: true,
    index: true,
  },

})

// hook generate _id before insert
Schema.pre('save', async function (next, Options) {
  if (this.isNew) {
    let id = Mongoose.Types.ObjectId()
    this._id = id.toString()
  }
})

export default Mongoose.model('ex_exchangeRates', Schema, 'ex_exchangeRates')
