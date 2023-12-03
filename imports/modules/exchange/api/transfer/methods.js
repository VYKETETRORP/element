import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { CallPromiseMixin } from 'meteor/didericis:callpromise-mixin'
import SimpleSchema from 'simpl-schema'

import throwError from '/imports/api/lib/throwError'
import rateLimit from '/imports/api/lib/rate-limit'

import Transfer from './transfer'
import TransferDetails from './transfer-details'
import { transferSchema, transferDetailSchema } from './schema'

// Find One refNo
export const findOneTransfer = new ValidatedMethod({
  name: 'pos.findOneTransfer',
  mixins: [CallPromiseMixin],
  validate: null,
  async run({ selector, options }) {
    if (Meteor.isServer) {
      selector = selector || {}
      options = options || {}
      let data = await Transfer.findOne(selector, options).lean()
      return data
    }
  },
})

// Find
export const fetchTransfer = new ValidatedMethod({
  name: 'ex.fetchTransfer',
  mixins: [CallPromiseMixin],
  validate: new SimpleSchema({
    selector: {
      type: Object,
      blackbox: true,
      optional: true,
    },
  }).validator(),
  async run({ selector }) {
    if (Meteor.isServer) {
      selector = selector || {}
      // let sort = { tranDate: 1 }
      const data = await Transfer.aggregate([
        {
          $match: { branchId: selector.branchId },
        },
        {
          $lookup: {
            from: 'app_employees',
            localField: 'fromEmployeeId',
            foreignField: '_id',
            as: 'fromEmployeeDoc',
          },
        },
        {
          $unwind: {
            path: '$fromEmployeeDoc',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: 'app_employees',
            localField: 'toEmployeeId',
            foreignField: '_id',
            as: 'toEmployeeDoc',
          },
        },
        {
          $unwind: {
            path: '$toEmployeeDoc',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: 'ex_transferDetails',
            localField: '_id',
            foreignField: 'transferId',
            as: 'detailsDoc',
          },
        },
        {
          $unwind: {
            path: '$detailsDoc',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: 'ex_exchangeCurrency',
            localField: 'detailsDoc.currencyId',
            foreignField: '_id',
            as: 'currencyDoc',
          },
        },
        {
          $unwind: {
            path: '$currencyDoc',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $match: selector,
        },
        {
          $group: {
            _id: '$_id',
            tranDate: { $last: '$tranDate' },
            fromEmpName: { $last: '$fromEmployeeDoc.name' },
            toEmpName: { $last: '$toEmployeeDoc.name' },
            tranType: { $last: '$tranType' },
            details: {
              $push: {
                currencyName: '$currencyDoc.name',
                amount: { $toDouble: '$detailsDoc.amount' },
                symbol: '$currencyDoc.symbol',
              },
            },
          },
        },

        {
          $sort: { tranDate: -1 },
        },
      ]).allowDiskUse(true)
      return data
    }
  },
})

// Find One
export const findTransferById = new ValidatedMethod({
  name: 'ex.findTransferById',
  mixins: [CallPromiseMixin],
  validate: new SimpleSchema({
    _id: String,
  }).validator(),
  async run(_id) {
    if (Meteor.isServer) {
      try {
        let doc = await Transfer.findOne({ _id }).lean()
        if (!doc) throw `This Transfer deleted!`
        let details = []
        if (doc) {
          delete doc.__v
          details = await TransferDetails.aggregate([
            {
              $match: { transferId: _id._id },
            },
            {
              $lookup: {
                from: 'ex_exchangeCurrency',
                localField: 'currencyId',
                foreignField: '_id',
                as: 'currencyDoc',
              },
            },
            {
              $unwind: {
                path: '$currencyDoc',
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $project: {
                // cashId: 1,
                currencyId: '$currencyDoc._id',
                currencyName: '$currencyDoc.name',
                // symbol: '$currencyDoc.symbol',
                // tranDate: 1,
                amount: { $toDouble: '$amount' },
              },
            },
          ])
        }
        return { doc, details }
      } catch (err) {
        console.log('Error', err)
        throwError('Find Transfer by id error', err)
      }
    }
  },
})

// Insert
export const insertTransfer = new ValidatedMethod({
  name: 'ex.insertTransfer',
  mixins: [CallPromiseMixin],
  validate: new SimpleSchema({
    doc: transferSchema,
    details: {
      type: Array,
    },
    'details.$': transferDetailSchema,
  }).validator(),
  async run({ doc, details }) {
    if (Meteor.isServer) {
      try {
        let parentDoc = new Transfer(doc)
        let res = await parentDoc.save()
        // loop pick details
        let list = pickupDetails({
          details,
          parentId: res.id,
          tranDate: parentDoc.tranDate,
          branchId: parentDoc.branchId,
        })

        // Insert details
        if (list.length) {
          await TransferDetails.insertMany(list)
        }

        return res.id
      } catch (err) {
        console.log('Error', err)
        throwError('Insert Transfer error', err)
      }
    }
  },
})

// Update
export const updateTransfer = new ValidatedMethod({
  name: 'ex.updateTransfer',
  mixins: [CallPromiseMixin],
  validate: new SimpleSchema({
    doc: transferSchema,
    details: {
      type: Array,
    },
    'details.$': transferDetailSchema,
  }).validator(),
  async run({ doc, details }) {
    if (Meteor.isServer) {
      try {
        const parentId = doc._id
        const tranDate = doc.tranDate
        const branchId = doc.branchId

        let preDoc = await Transfer.findOne({ _id: parentId }).lean()
        if (!preDoc) throw `This Transfer deleted!`

        // Remove details
        if (parentId) await TransferDetails.deleteMany({ transferId: parentId })
        // Update
        let res = await Transfer.updateOne({ _id: parentId }, { $set: doc })

        // Pick up details
        let list = pickupDetails({
          details,
          parentId,
          tranDate,
          branchId,
        })
        // Insert details
        if (list.length) {
          await TransferDetails.insertMany(list)
        }

        return res
      } catch (err) {
        console.log('Error', err)
        throwError('Update Transfer error', err)
      }
    }
  },
})

// remove
export const removeTransferById = new ValidatedMethod({
  name: 'ex.removeTransferById',
  mixins: [CallPromiseMixin],
  validate: new SimpleSchema({
    _id: String,
  }).validator(),
  async run(_id) {
    if (Meteor.isServer) {
      try {
        let preDoc = await Transfer.findOne({ _id }).lean()
        if (!preDoc) throw `This Transfer deleted!`

        let res = await Transfer.deleteOne({ _id })

        res = await TransferDetails.deleteMany({ transferId: _id._id })

        return res
      } catch (err) {
        console.log('Error', err)
        throwError('Remove Transfer error', err)
      }
    }
  },
})

// Pickup details
const pickupDetails = ({ details, parentId, tranDate, branchId }) => {
  let list = []
  for (let i = 0; i < details.length; i++) {
    let it = details[i]
    let id = `${parentId}-${i}`
    // push
    list.push({
      _id: id,
      transferId: parentId,
      currencyId: it.currencyId,
      tranDate,
      amount: it.amount,
      branchId,
    })
  }
  return list
}

// // Check Customer Length
// export const findCustomerLengths = new ValidatedMethod({
//   name: 'ex.findCustomerLengths',
//   mixins: [CallPromiseMixin],
//   validate: new SimpleSchema({
//     _id: String,
//   }).validator(),
//   async run({ _id }) {
//     if (Meteor.isServer) {
//       return await CashDeposit.find({ customerId: _id }).count()
//     }
//   },
// })

// // Check RateDatail Length
// export const findRateDeialLengths = new ValidatedMethod({
//   name: 'ex.findRateDeialLengths',
//   mixins: [CallPromiseMixin],
//   validate: new SimpleSchema({
//     _id: String,
//   }).validator(),
//   async run({ _id }) {
//     if (Meteor.isServer) {
//       const data = TransactionDetails.aggregate([
//         {
//           $lookup: {
//             from: 'ex_exchangeRateDetails',
//             localField: 'exchangeRateDetailId',
//             foreignField: '_id',
//             as: 'exchangeRateDetailDoc',
//           },
//         },
//         {
//           $unwind: {
//             path: '$exchangeRateDetailDoc',
//             preserveNullAndEmptyArrays: true,
//           },
//         },
//         {
//           $project: {
//             exchangeRateId: '$exchangeRateDetailDoc.exchangeRateId',
//           },
//         },
//         {
//           $match: { exchangeRateId: _id },
//         },
//       ])
//       return data
//     }
//   },
// })

rateLimit({
  methods: [
    findTransferById,
    insertTransfer,
    updateTransfer,
    removeTransferById,
  ],
})
