import Mongoose from 'mongoose'
// const SchemaTypes = Mongoose.Schema.Types

const Schema = new Mongoose.Schema(
  {
    _id: String,
    name: {
      type: String,
      required: true,
    },
    telephone:{
      type:String,
    },
    address:{
      type:String
    },
    branchId:String
  },
  // { timestamps: true }
)

// hook generate _id before insert
Schema.pre('save', async function (next, Options) {
  if (this.isNew) {
    let id = Mongoose.Types.ObjectId()
    this._id = id.toString()
  }
})


export default Mongoose.model('ex_customers', Schema, 'ex_customers')
