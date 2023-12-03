import Mongoose from 'mongoose'
// const SchemaTypes = Mongoose.Schema.Types

const Schema = new Mongoose.Schema(
  {
    _id: String,
    customerId: {
      type: String,
      optional: true,
    },
    employeeId: {
      type: String,
      optional: true,
    },
    providerId: {
      type: String,
      optional: true,
    },
    tranTypeId: {
      type: String,
      optional: true,
    },
    currencyId: {
      type: String,
      optional: true,
    },
    branchId: String,
  }
  // { timestamps: true }
)

// hook generate _id before insert
Schema.pre('save', async function (next, Options) {
  if (this.isNew) {
    let id = Mongoose.Types.ObjectId()
    this._id = id.toString()
  }
})

export default Mongoose.model('ex_settings', Schema, 'ex_settings')
