import Mongoose from 'mongoose'
const SchemaTypes = Mongoose.Schema.Types
const child = new Mongoose.Schema(
  {
    label: String,
    styles: {
      type: Object,
      default: {},
    },
    src: String,
    imageId: String,
    className: String,
    prop: String,
    propStyles: {
      type: Object,
      default: {},
    },
  },
  { _id: false, strict: false, minimize: false }
)
const customSchema = new Mongoose.Schema(
  {
    tag: String,
    label: String,
    value: [child],
    className: String, //power-by-text
    styles: {
      type: Object,
      default: {},
    },
  },
  { _id: false, strict: false, minimize: false }
)

const Schema = new Mongoose.Schema({
  _id: String,
  headers: {
    type: [customSchema],
  },
  contents: {
    type: [customSchema],
  },
  footers: {
    type: [customSchema],
  },
  branchId: String,
})

// hook generate _id before insert
Schema.pre('save', function () {
  if (this.isNew) {
    const id = new Mongoose.Types.ObjectId()
    this._id = id.toString()
  }
})

export default Mongoose.model('ex_customTemplate', Schema, 'ex_customTemplate')
