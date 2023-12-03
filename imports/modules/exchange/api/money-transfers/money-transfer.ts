import { cloneDeep } from 'lodash'
import BaseCollection from '/imports/api/lib/BaseCollection'
import SimpleSchema from 'simpl-schema'

const MoneyTransfers: MongoBaseCollection<MoneyTransfer.Schema> =
  new BaseCollection('ex_moneyTransfers')

const schema = new SimpleSchema({
  _id: String,
  refNo: String,
  tranDate: Date,
  transferDate: Date,
  customerId: String,
  employeeId: String,
  tranType: String,
  currencyId: String,
  amount: Number,
  fee: Number,
  brokerFee: Number,
  memo: {
    type: String,
    optional: true,
  },
  branchId: String,
})

export const insertMoneyTransferInput = cloneDeep(schema).omit('_id')
export const updateMoneyTransferInput = schema

if (MoneyTransfers.attachSchema) {
  MoneyTransfers.attachSchema(schema)
}

export default MoneyTransfers
