import { cloneDeep } from 'lodash'
import BaseCollection from '/imports/api/lib/BaseCollection'
import SimpleSchema from 'simpl-schema'

const FeeChargeDetails: MongoBaseCollection<FeeChargeDetails.Schema> =
  new BaseCollection('ex_feeChargeDetails')

const schema = new SimpleSchema({
  _id: {
    type: String,
    optional: true,
  },
  parentId: String,
  currencyId: {
    type: String,
  },
  amount: Number,
  rateType: String,
  value: Number,
  branchId: String,
})

if (FeeChargeDetails.attachSchema) {
  FeeChargeDetails.attachSchema(schema)
}

export const validSchema = cloneDeep(schema).omit('_id', 'parentId', 'branchId')

export default FeeChargeDetails
