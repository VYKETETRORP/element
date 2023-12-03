import Mongoose from 'mongoose'
// const SchemaTypes = Mongoose.Schema.Types

const Schema = new Mongoose.Schema(
  {
    _id: String,
    name: {
      type: String,
      required: true,
    },
    symbol: {
      type: String,
      required: true,
    },
    // toSymbol:{
    //   type:String,
    //   required:true
    // },
    // operator: {
    //   type: String,
    //   required: true,
    // },
    // fromSymbol:{
    //   type:String,
    //   required:true
    // },
    order: {
      type: Number,
      required: true,
    },

    base: {
      type: Boolean,
      required: false,
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

export default Mongoose.model(
  'ex_exchangeCurrency',
  Schema,
  'ex_exchangeCurrency'
)
