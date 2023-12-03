import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { CallPromiseMixin } from 'meteor/didericis:callpromise-mixin'
import SimpleSchema from 'simpl-schema'

// lib
import throwError from '/imports/api/lib/throwError'
import pickup from './pickup'

// col
import FeeCharges, { schema } from './collections'
import FeeChargeDetails, {
  validSchema as detailSchema,
} from './collection-details'

// Find
export const findFeeCharges = new ValidatedMethod({
  name: 'ex.findFeeCharges',
  mixins: [CallPromiseMixin],
  validate: new SimpleSchema({
    selector: {
      type: Object,
      blackbox: true,
      optional: true,
    },
    options: {
      type: Object,
      blackbox: true,
      optional: true,
    },
  }).validator(),
  run({ selector = {}, options = {} }) {
    if (Meteor.isServer) {
      try {
        if (!('sort' in options)) {
          options.sort = { tranDate: -1 }
        }
        const data = FeeCharges.find(selector, options).fetch()
        return data
      } catch (error) {
        console.log(error)
        throwError('find fee charge', error)
      }
    }
  },
})

export const getLatestFeeCharge = new ValidatedMethod({
  name: 'ex.getLatestFeeCharge',
  mixins: [CallPromiseMixin],
  validate: new SimpleSchema({
    tranType: String,
    branchId: String,
  }).validator(),
  run({ tranType, branchId }) {
    if (Meteor.isServer) {
      try {
        let brokerFeeDetails: any[] = [],
          ownFeeDetails: any[] = []
        // Owner Fee
        const ownFeeDoc = FeeCharges.find(
          { tranType, feeType: 'OwnFee' },
          { sort: { tranDate: -1 }, limit: 1 }
        ).fetch()
        if (ownFeeDoc.length) {
          const ownFeeId = ownFeeDoc[0]._id || ''
          ownFeeDetails = FeeChargeDetails.find(
            {
              parentId: ownFeeId,
            },
            { sort: { amount: 1 } }
          ).fetch()
        }
        // Broker Fee
        const brokerFeeDoc = FeeCharges.find(
          { tranType, feeType: 'BrokerFee' },
          { sort: { tranDate: -1 }, limit: 1 }
        ).fetch()
        if (brokerFeeDoc.length) {
          const brokerFeeId = brokerFeeDoc[0]._id || ''
          brokerFeeDetails = FeeChargeDetails.find(
            {
              parentId: brokerFeeId,
            },
            { sort: { amount: 1 } }
          ).fetch()
        }
        return { ownFeeDetails, brokerFeeDetails }
      } catch (error) {
        console.log(error)
        throwError('get last fee charge', error)
      }
    }
  },
})

// Find
export const getFeeChargeById = new ValidatedMethod({
  name: 'ex.getFeeChargeById',
  mixins: [CallPromiseMixin],
  validate: new SimpleSchema({
    id: String,
  }).validator(),
  run({ id }: { id: string }) {
    if (Meteor.isServer) {
      try {
        const data = FeeCharges.findOne({ _id: id })
        if (!data) throw `This record deleted!`

        const details = FeeChargeDetails.find({ parentId: id }).fetch()
        return { data, details }
      } catch (error) {
        throwError('get fee charge by id', error)
      }
    }
  },
})

// Insert
export const insertFeeCharge = new ValidatedMethod({
  name: 'ex.insertFeeCharge',
  mixins: [CallPromiseMixin],
  validate: new SimpleSchema({
    doc: schema,
    details: Array,
    'details.$': detailSchema,
  }).validator(),
  async run({
    doc,
    details,
  }: {
    doc: FeeCharge.Input
    details: FeeChargeDetails.Input[]
  }) {
    if (Meteor.isServer) {
      try {
        const id = FeeCharges.insert(doc)
        // Pick data
        const detailData = pickup({
          parentId: id,
          branchId: doc.branchId,
          details,
        })
        // Insert
        await FeeChargeDetails.rawCollection().insertMany(detailData)

        return id
      } catch (error) {
        console.log('error', error)
        throwError('insert fee charge', error)
      }
    }
  },
})

// Update
export const updateFeeCharge = new ValidatedMethod({
  name: 'ex.updateFeeCharge',
  mixins: [CallPromiseMixin],
  validate: new SimpleSchema({
    doc: schema,
    details: Array,
    'details.$': detailSchema,
  }).validator(),
  async run({
    doc,
    details,
  }: {
    doc: FeeCharge.Schema
    details: FeeChargeDetails.Input[]
  }) {
    if (Meteor.isServer) {
      try {
        const id = doc._id
        const res = FeeCharges.update({ _id: id }, { $set: doc })

        // Pick data
        const detailData = pickup({
          parentId: id,
          branchId: doc.branchId,
          details,
        })

        // Remove before insert
        FeeChargeDetails.remove({ parentId: id })
        // Insert
        await FeeChargeDetails.rawCollection().insertMany(detailData)

        return res
      } catch (error) {
        throwError('update fee charge', error)
      }
    }
  },
})

// Remove
export const removeFeeCharge = new ValidatedMethod({
  name: 'ex.removeFeeCharge',
  mixins: [CallPromiseMixin],
  validate: new SimpleSchema({
    id: String,
  }).validator(),
  run({ id }: { id: string }) {
    if (Meteor.isServer) {
      try {
        FeeChargeDetails.remove({ parentId: id })
        return FeeCharges.remove({ _id: id })
      } catch (error) {
        throwError('remove fee charge', error)
      }
    }
  },
})
