import Mongoose from "mongoose";
//import { setNextSeq, getSetNextSeq } from '/imports/api/lib/nextSequence'
const Schema = new Mongoose.Schema({
  _id: String,
  refNo: {
    type: String,
    required: true,
  },
  tranTypeId: {
    type: String,
    required: true,
    index: true,
  },
  customerId: {
    type: String,
    required: true,
    index: true,
  },
  employeeId: {
    type: String,
    required: true,
    index: true,
  },
  tranDate: {
    type: Date,
    required: true,
    index: true,
  },
  memo: {
    type: String,
  },
  branchId: {
    type: String,
    required: true,
    index: true,
  },
});

// hook generate _id before insert
Schema.pre("save", async function (next, Options) {
  if (this.isNew) {
    let id = Mongoose.Types.ObjectId();
    this._id = id.toString();
  }
});
// refNo
Schema.post("save", async function (doc) {
  // console.log('post save isNew', doc);
  await setNextSeq.call({
    id: `ex_transactionRefNo${this.branchId}`,
    seqVal: doc.refNo,
  });
});

export default Mongoose.model("ex_transaction", Schema, "ex_transaction");
