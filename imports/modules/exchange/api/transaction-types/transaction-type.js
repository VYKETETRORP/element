import Mongoose from 'mongoose'
// const SchemaTypes = Mongoose.Schema.Types

const Schema = new Mongoose.Schema({
  _id: String,
  name: {
    type: String,
    required: true,
  },
})

// hook generate _id before insert
Schema.pre('save', async function (next, Options) {
  if (this.isNew) {
    let id = Mongoose.Types.ObjectId()
    this._id = id.toString()
  }
})

export default Mongoose.model('ex_tranTypes', Schema, 'ex_tranTypes')
