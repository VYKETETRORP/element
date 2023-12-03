import BaseCollection from '/imports/api/lib/BaseCollection'
import SimpleSchema from 'simpl-schema'

const FeeCharges: MongoBaseCollection<FeeCharge.Schema> = new BaseCollection(
  'ex_feeCharges'
)

export const schema = new SimpleSchema({
  _id: {
    type: String,
    optional: true,
  },
  tranDate: Date,
  tranType: {
    type: String,
    allowedValues: ['In', 'Out'],
  },
  feeType: {
    type: String,
    allowedValues: ['OwnFee', 'BrokerFee'],
  },
  branchId: String,
})

if (FeeCharges.attachSchema) {
  FeeCharges.attachSchema(schema)
}

export default FeeCharges
