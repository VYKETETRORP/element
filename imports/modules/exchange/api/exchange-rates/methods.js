import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { CallPromiseMixin } from 'meteor/didericis:callpromise-mixin'
import SimpleSchema from 'simpl-schema'

import throwError from '/imports/api/lib/throwError'
import rateLimit from '/imports/api/lib/rate-limit'

import ExchangeRates from './exchange-rate'
import ExchangeRateDetails from './exchange-rate-details'
import { rateSchema, detailSchema } from './schema'
import exchangeRate from './exchange-rate'

// Find
export const findExchangeRate = new ValidatedMethod({
  name: 'ex.findExchangeRate',
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
      const data = await ExchangeRates.aggregate([
        {
          $match: { branchId: selector.branchId },
        },
        {
          $lookup: {
            from: 'ex_providers',
            localField: 'providerId',
            foreignField: '_id',
            as: 'providerDoc',
          },
        },
        {
          $unwind: {
            path: '$providerDoc',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: 'ex_exchangeRateDetails',
            localField: '_id',
            foreignField: 'exchangeRateId',
            as: 'detailsDoc',
          },
        },
        {
          $unwind: {
            path: '$detailsDoc',
            preserveNullAndEmptyArrays: true,
          },
        },
        // {
        //   $lookup: {
        //     from: 'ex_exchangeCurrency',
        //     localField: 'detailsDoc.exchangeCurrencyId',
        //     foreignField: '_id',
        //     as: 'currencyDoc',
        //   },
        // },
        // {
        //   $unwind: {
        //     path: '$currencyDoc',
        //     preserveNullAndEmptyArrays: true,
        //   },
        // },
        {
          $lookup: {
            from: 'ex_exchangeCurrency',
            localField: 'detailsDoc.baseExchangeCurrencyId',
            foreignField: '_id',
            as: 'baseCurrencyDoc',
          },
        },
        {
          $unwind: {
            path: '$baseCurrencyDoc',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: 'ex_exchangeCurrency',
            localField: 'detailsDoc.toExchangeCurrencyId',
            foreignField: '_id',
            as: 'toCurrencyDoc',
          },
        },
        {
          $unwind: {
            path: '$toCurrencyDoc',
            preserveNullAndEmptyArrays: true,
          },
        },
        // {
        //   $addFields: {
        //     rate: { $toDouble: '$detailsDoc.rate' },
        //   },
        // },
        {
          $match: selector,
        },
        {
          $group: {
            _id: '$_id',
            tranDate: { $last: '$tranDate' },
            name: { $last: '$providerDoc.name' },
            details: {
              $push: {
                _id: '$detailsDoc._id',
                baseName: '$baseCurrencyDoc.name',
                toName: '$toCurrencyDoc.name',
                bid: { $toDouble: '$detailsDoc.bid' },
                ask: { $toDouble: '$detailsDoc.ask' },
                symbol: '$baseCurrencyDoc.symbol',
                //status: '$status',
                // rate: '$rate',
                //status: '$detailsDoc.status',
                status: '$detailsDoc.status',

                // operator: '$currencyDoc.operator',
              },
            },
          },
        },
        // {
        //   $match: selector,
        // },
        {
          $sort: { tranDate: -1 },
        },
      ]).allowDiskUse(true)
      return data //await ExchangeCurrency.find(selector).sort(sort).lean()
    }
  },
})
// Find One
export const findExchangeRateById = new ValidatedMethod({
  name: 'ex.findExchangeRateById',
  mixins: [CallPromiseMixin],
  validate: new SimpleSchema({
    _id: String,
  }).validator(),
  async run(_id) {
    if (Meteor.isServer) {
      try {
        let doc = await ExchangeRates.findOne({ _id }).lean()
        if (!doc) throw `This transaction deleted!`
        let details = []
        if (doc) {
          delete doc.__v
          details = await ExchangeRateDetails.aggregate([
            {
              $match: { exchangeRateId: _id._id },
            },

            {
              $lookup: {
                from: 'ex_exchangeCurrency',
                localField: 'baseExchangeCurrencyId',
                foreignField: '_id',
                as: 'baseCurrencyDoc',
              },
            },
            {
              $unwind: {
                path: '$baseCurrencyDoc',
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $lookup: {
                from: 'ex_exchangeCurrency',
                localField: 'toExchangeCurrencyId',
                foreignField: '_id',
                as: 'toCurrencyDoc',
              },
            },
            {
              $unwind: {
                path: '$toCurrencyDoc',
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $project: {
                baseName: '$baseCurrencyDoc.name',
                baseExchangeCurrencyId: 1,
                toExchangeCurrencyId: 1,
                toName: '$toCurrencyDoc.name',
                bid: { $toDouble: '$bid' },
                ask: { $toDouble: '$ask' },
                status: 1,
              },
            },
          ])
        }
        return { doc, details }
      } catch (err) {
        console.log('Error', err)
        throwError('Find customer by id error', err)
      }
    }
  },
})

// Insert
export const insertExchangeRate = new ValidatedMethod({
  name: 'ex.insertExchangeRate',
  mixins: [CallPromiseMixin],
  validate: new SimpleSchema({
    doc: rateSchema,
    details: {
      type: Array,
    },
    'details.$': detailSchema.omit('exchangeRateId', 'branchId'),
  }).validator(),
  async run({ doc, details }) {
    if (Meteor.isServer) {
      try {
        let parentDoc = new ExchangeRates(doc)
        let res = await parentDoc.save()
        // loop pick details
        let list = pickupDetails({
          details,
          parentId: res.id,
          branchId: parentDoc.branchId,
        })
        //console.log('list', list)
        // Insert details
        if (list.length) {
          await ExchangeRateDetails.insertMany(list)
        }

        return res.id
      } catch (err) {
        console.log('Error', err)
        throwError('Insert customer error', err)
      }
    }
  },
})

//updateNotificationStatus(oldStatus,newStatus){
//  return Notification.update({ status: oldStatus }, { $set: { status: newStatus } }, { multi: true });
//  // return Notification.update({$set:{status}})
//  // return Notification.update({ $set: { status:'readed' } });
//}

//export const updateStatus = new ValidatedMethod({
//  name:'ex.updateStatus',
//  mixins:[CallPromiseMixin],
//  validate:new SimpleSchema({

//})

//})

export const updateStatus = new ValidatedMethod({
  name: 'ex.updateStatus',
  mixins: [CallPromiseMixin],
  validate: null,
  //async run({ id, status, index }) {
  //  //const document = ExchangeRates.findOne(id)
  //  //ExchangeRates.updateOne({ _id: id }, { $set: { status } })
  //},

  async run({ id, status }) {
    if (Meteor.isServer) {
      const document = await ExchangeRateDetails.findOne({ _id: id }).lean()
      if (document) {
        // Update the status to "inactive"
        const res = await ExchangeRateDetails.updateOne(
          { _id: id },
          { $set: { status } }
        )
        return res.matchedCount
      } else {
        throw new Meteor.Error('document-not-found', 'Document not found')
      }
    }
  },
})

// Update
export const updateExchangeRate = new ValidatedMethod({
  name: 'ex.updateExchangeRate',
  mixins: [CallPromiseMixin],
  validate: new SimpleSchema({
    doc: rateSchema,
    details: {
      type: Array,
    },
    'details.$': detailSchema.omit('exchangeRateId', 'branchId'),
  }).validator(),
  async run({ doc, details }) {
    if (Meteor.isServer) {
      try {
        const parentId = doc._id
        let preDoc = await ExchangeRates.findOne({ _id: parentId }).lean()
        if (!preDoc) throw `This transaction deleted!`

        // Remove details
        if (parentId)
          await ExchangeRateDetails.deleteMany({ exchangeRateId: parentId })

        // Update
        let res = await ExchangeRates.updateOne(
          { _id: parentId },
          { $set: doc }
        )

        // Pick up details
        let list = pickupDetails({ details, parentId, branchId: doc.branchId })
        // Insert details
        if (list.length) {
          await ExchangeRateDetails.insertMany(list)
        }
        //console.log('res', res)
        return res
      } catch (err) {
        console.log('Error', err)
        throwError('Update Exchange Rate error', err)
      }
    }
  },
})

// Update
export const removeExchangeRateById = new ValidatedMethod({
  name: 'ex.removeExchangeRateById',
  mixins: [CallPromiseMixin],
  validate: new SimpleSchema({
    _id: String,
  }).validator(),
  async run(_id) {
    if (Meteor.isServer) {
      try {
        let preDoc = await ExchangeRates.findOne({ _id }).lean()
        if (!preDoc) throw `This transaction deleted!`

        let res = await ExchangeRates.deleteOne({ _id })

        res = await ExchangeRateDetails.deleteMany({ exchangeRateId: _id._id })

        return res
      } catch (err) {
        console.log('Error', err)
        throwError('Remove customer error', err)
      }
    }
  },
})

// Pickup details
const pickupDetails = ({ details, parentId, branchId }) => {
  let list = []
  for (let i = 0; i < details.length; i++) {
    let it = details[i]
    let id = `${parentId}-${i}`
    // push
    list.push({
      _id: id,
      exchangeRateId: parentId,
      // exchangeCurrencyId: it.exchangeCurrencyId,
      // rate: it.rate,
      baseExchangeCurrencyId: it.baseExchangeCurrencyId,
      toExchangeCurrencyId: it.toExchangeCurrencyId,
      bid: it.bid,
      ask: it.ask,
      branchId: branchId,
      status: it.status,
    })
  }

  return list
}
// Check Provider Length
export const findProviderLengths = new ValidatedMethod({
  name: 'ex.findProviderLengths',
  mixins: [CallPromiseMixin],
  validate: new SimpleSchema({
    _id: String,
  }).validator(),
  async run(_id) {
    if (Meteor.isServer) {
      return await ExchangeRates.find({ providerId: _id }).lean()
    }
  },
})

// Check Currency Length
export const findCurrencyLengths = new ValidatedMethod({
  name: 'ex.findCurrencyLengths',
  mixins: [CallPromiseMixin],
  validate: new SimpleSchema({
    _id: String,
  }).validator(),
  async run({ _id }) {
    if (Meteor.isServer) {
      let base = {
        baseExchangeCurrencyId: _id,
      }
      let to = {
        toExchangeCurrencyId: _id,
      }
      let data = await ExchangeRateDetails.find({
        $or: [base, to],
      }).lean()
      return data
    }
  },
})

// get Exchange Rate
export const fetchExchangeRateOperator = new ValidatedMethod({
  name: 'ex.fetchExchangeRateOperator',
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
      let data = await ExchangeRateDetails.aggregate([
        {
          $match: selector,
        },
        {
          $lookup: {
            from: 'ex_exchangeCurrency',
            localField: 'baseExchangeCurrencyId',
            foreignField: '_id',
            as: 'baseCurrencyDoc',
          },
        },
        {
          $unwind: {
            path: '$baseCurrencyDoc',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: 'ex_exchangeCurrency',
            localField: 'toExchangeCurrencyId',
            foreignField: '_id',
            as: 'toCurrencyDoc',
          },
        },
        {
          $unwind: {
            path: '$toCurrencyDoc',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $group: {
            _id: { baseId: '$baseCurrencyDoc._id', toId: '$toCurrencyDoc._id' },
            exchangeDetailRateId: { $last: '$_id' },
            baseCurrencyId: { $last: '$baseCurrencyDoc._id' },
            baseName: { $last: '$baseCurrencyDoc.name' },
            toCurrencyId: { $last: '$toCurrencyDoc._id' },
            toName: { $last: '$toCurrencyDoc.name' },
            baseSymbol: { $last: '$baseCurrencyDoc.symbol' },
            toSymbol: { $last: '$toCurrencyDoc.symbol' },
            bid: { $last: '$bid' },
            ask: { $last: '$ask' },
            status: { $last: '$status' },
          },
        },
        {
          $addFields: {
            bid: {
              $toDouble: '$bid',
            },
            ask: {
              $toDouble: '$ask',
            },
          },
        },
      ]).allowDiskUse(true)
      let list = []

      for (let it of data) {
        list.push(
          ...[
            // {
            //   label: `${it.baseCurrencyDoc.name}-${
            //     it.toCurrencyDoc.name
            //   } (${parseFloat(it.bid)})`,
            //   value: it._id,
            //   symbol: '*',
            //   type: 'bid',
            //   rate: parseFloat(it.bid),
            // },
            // {
            //   label: `${it.toCurrencyDoc.name}-${
            //     it.baseCurrencyDoc.name
            //   } (${parseFloat(it.ask)})`,
            //   value: it._id,
            //   symbol: '/',
            //   type: 'ask',
            //   rate: parseFloat(it.ask),
            // },
            {
              label: `${it.baseName}-${it.toName}  (${it.bid})`,
              // value: `${it.exchangeDetailRateId}-`,
              exchangeRateDetailId: it.exchangeDetailRateId,
              value: `${it.baseCurrencyId}-${it.toCurrencyId}`,
              operator: '*',
              type: 'bid',
              rate: it.bid,
              baseCurrencyId: it.baseCurrencyId,
              toCurrencyId: it.toCurrencyId,
              baseSymbol: it.baseSymbol,
              toSymbol: it.toSymbol,
            },
            {
              label: `${it.toName}-${it.baseName}  (${it.ask})`,
              // value: it.exchangeDetailRateId,
              exchangeRateDetailId: it.exchangeDetailRateId,
              value: `${it.toCurrencyId}-${it.baseCurrencyId}`,
              operator: '/',
              type: 'ask',
              rate: it.ask,
              baseCurrencyId: it.toCurrencyId,
              toCurrencyId: it.baseCurrencyId,
              baseSymbol: it.toSymbol,
              toSymbol: it.baseSymbol,
            },
          ]
        )
      }
      return list
    }
  },
})

// get Exchange Rate last add
export const fetchExchangeRate = new ValidatedMethod({
  name: 'ex.fetchExchangeRate',
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
      let data = await ExchangeRateDetails.aggregate([
        {
          $match: selector,
        },
        {
          $lookup: {
            from: 'ex_exchangeCurrency',
            localField: 'baseExchangeCurrencyId',
            foreignField: '_id',
            as: 'baseCurrencyDoc',
          },
        },
        {
          $unwind: {
            path: '$baseCurrencyDoc',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: 'ex_exchangeCurrency',
            localField: 'toExchangeCurrencyId',
            foreignField: '_id',
            as: 'toCurrencyDoc',
          },
        },
        {
          $unwind: {
            path: '$toCurrencyDoc',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: 'ex_exchangeRates',
            localField: 'exchangeRateId',
            foreignField: '_id',
            as: 'exchangeRateDoc',
          },
        },
        {
          $unwind: {
            path: '$exchangeRateDoc',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $group: {
            _id: { baseId: '$baseCurrencyDoc._id', toId: '$toCurrencyDoc._id' },
            // exchangeDetailRateId: { $last: '$_id' },
            orderBase: { $last: '$baseCurrencyDoc.order' },
            baseName: { $last: '$baseCurrencyDoc.name' },
            toName: { $last: '$toCurrencyDoc.name' },
            baseSymbol: { $last: '$baseCurrencyDoc.symbol' },
            toSymbol: { $last: '$toCurrencyDoc.symbol' },
            bid: { $last: '$bid' },
            ask: { $last: '$ask' },
            //status: { $last: '$status' },
          },
        },
        {
          $sort: { orderBase: 1 },
        },
        {
          $addFields: {
            bid: {
              $toDouble: '$bid',
            },
            ask: {
              $toDouble: '$ask',
            },
          },
        },
      ]).allowDiskUse(true)
      return data
    }
  },
})

rateLimit({
  methods: [
    findExchangeRate,
    findExchangeRateById,
    insertExchangeRate,
    updateExchangeRate,
    removeExchangeRateById,
    fetchExchangeRateOperator,
    updateStatus,
  ],
})
