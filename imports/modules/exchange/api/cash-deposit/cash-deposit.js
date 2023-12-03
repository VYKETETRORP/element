import Mongoose from 'mongoose'
const Schema = new Mongoose.Schema({
  _id: String,
  // refNo: {
  //   type: String,
  //   required: true,
  // },
  tranType: {
    type: String,
    required: true,
  },
  employeeId: {
    type: String,
    required: true,
  },
  fromEmployeeId: String,
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
// // refNo
// Schema.post('save', async function (doc) {
//   // console.log('post save isNew', doc);
//   await setNextSeq.call({
//     id: `ex_CashDepositRefNo${this.branchId}`,
//     seqVal: doc.refNo,
//   })
// })

export default Mongoose.model('ex_cashDeposit', Schema, 'ex_cashDeposit')
