import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { CallPromiseMixin } from 'meteor/didericis:callpromise-mixin'
import SimpleSchema from 'simpl-schema'

import throwError from '/imports/api/lib/throwError'
import rateLimit from '/imports/api/lib/rate-limit'
//collection
import CashDeposit from './cash-deposit'
import CashDepositDetails from './cash-deposit-details'
import ExchangeCurrency from '../exchange-currency/exchange-currency'
import Transaction from '../transaction/transaction'
import TransactionDetails from '../transaction/transaction-details'
//schema
import { cashDepositSchema, cashDepositDetailSchema } from './schema'
import _ from 'lodash'

// Find One refNo
export const findOneCashDeposit = new ValidatedMethod({
  name: 'pos.findOneCashDeposit',
  mixins: [CallPromiseMixin],
  validate: null,
  async run({ selector, options }) {
    if (Meteor.isServer) {
      // Meteor._sleepForMs(200)
      selector = selector || {}
      options = options || {}
      let data = await CashDeposit.findOne(selector, options).lean()
      return data
    }
  },
})

// Find CashDeposit
export const fetchCashDeposit = new ValidatedMethod({
  name: 'ex.fetchCashDeposit',
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
      const data = await CashDeposit.aggregate([
        { $match: selector },
        {
          $lookup: {
            from: 'app_employees',
            localField: 'employeeId',
            foreignField: '_id',
            as: 'employeeDoc',
          },
        },
        {
          $unwind: {
            path: '$employeeDoc',
            preserveNullAndEmptyArrays: true,
          },
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
            from: 'ex_cashDepositDetails',
            localField: '_id',
            foreignField: 'cashId',
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
          $sort: { tranDate: -1 },
        },
        // {
        //   $group: {
        //     _id: '$_id',
        //     tranDate: { $last: '$tranDate' },
        //     name: { $last: '$employeeDoc.name' },
        //     employeeId: { $last: '$employeeDoc._id' },
        //     fromEmployeeId: { $last: '$fromEmployeeDoc._id' },
        //     fromName: { $last: '$fromEmployeeDoc.name' },
        //     tranType: { $last: '$tranType' },
        //     details: {
        //       $push: {
        //         currencyId: '$currencyDoc._id',
        //         currencyName: '$currencyDoc.name',
        //         amount: { $toDouble: '$detailsDoc.amount' },
        //         symbol: '$currencyDoc.symbol',
        //       },
        //     },
        //   },
        // },
        {
          $project: {
            _id: '$_id',
            tranDate: '$tranDate',
            name: '$employeeDoc.name',
            employeeId: '$employeeDoc._id',
            fromEmployeeId: '$fromEmployeeDoc._id',
            fromName: '$fromEmployeeDoc.name',
            tranType: '$tranType',
            currencyId: '$currencyDoc._id',
            currencyName: '$currencyDoc.name',
            amount: { $toDouble: '$detailsDoc.amount' },
            symbol: '$currencyDoc.symbol',
          },
        },
      ]).allowDiskUse(true)
      return data
    }
  },
})

// Find One
export const findCashDepositById = new ValidatedMethod({
  name: 'ex.findCashDepositById',
  mixins: [CallPromiseMixin],
  validate: new SimpleSchema({
    _id: String,
  }).validator(),
  async run(_id) {
    if (Meteor.isServer) {
      try {
        let doc = await CashDeposit.findOne({ _id }).lean()
        if (!doc) throw `This CashDeposit deleted!`
        let details = []
        if (doc) {
          delete doc.__v
          details = await CashDepositDetails.aggregate([
            {
              $match: { cashId: _id._id },
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
        throwError('Find CashDeposit by id error', err)
      }
    }
  },
})

// Insert
export const insertCashDeposit = new ValidatedMethod({
  name: 'ex.insertCashDeposit',
  mixins: [CallPromiseMixin],
  validate: new SimpleSchema({
    doc: cashDepositSchema,
    details: {
      type: Array,
    },
    'details.$': cashDepositDetailSchema,
  }).validator(),
  async run({ doc, details }) {
    if (Meteor.isServer) {
      try {
        let parentDoc = new CashDeposit(doc)
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
          await CashDepositDetails.insertMany(list)
        }

        return res.id
      } catch (err) {
        console.log('Error', err)
        throwError('Insert CashDeposit error', err)
      }
    }
  },
})

// Update
export const updateCashDeposit = new ValidatedMethod({
  name: 'ex.updateCashDeposit',
  mixins: [CallPromiseMixin],
  validate: new SimpleSchema({
    doc: cashDepositSchema,
    details: {
      type: Array,
    },
    'details.$': cashDepositDetailSchema,
  }).validator(),
  async run({ doc, details }) {
    if (Meteor.isServer) {
      try {
        const parentId = doc._id
        const tranDate = doc.tranDate
        const branchId = doc.branchId

        let preDoc = await CashDeposit.findOne({ _id: parentId }).lean()
        if (!preDoc) throw `This CashDeposit deleted!`

        // Remove details
        if (parentId) await CashDepositDetails.deleteMany({ cashId: parentId })
        // Update
        let res = await CashDeposit.updateOne({ _id: parentId }, { $set: doc })

        // Pick up details
        let list = pickupDetails({
          details,
          parentId,
          tranDate,
          branchId,
        })
        // Insert details
        if (list.length) {
          await CashDepositDetails.insertMany(list)
        }

        return res
      } catch (err) {
        console.log('Error', err)
        throwError('Update CashDeposit error', err)
      }
    }
  },
})

// remove
export const removeCashDepositById = new ValidatedMethod({
  name: 'ex.removeCashDepositById',
  mixins: [CallPromiseMixin],
  validate: new SimpleSchema({
    _id: String,
  }).validator(),
  async run(_id) {
    if (Meteor.isServer) {
      try {
        let preDoc = await CashDeposit.findOne({ _id }).lean()
        if (!preDoc) throw `This CashDeposit deleted!`

        let res = await CashDeposit.deleteOne({ _id })

        res = await CashDepositDetails.deleteMany({ cashId: _id._id })

        return res
      } catch (err) {
        console.log('Error', err)
        throwError('Remove CashDeposit error', err)
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
      cashId: parentId,
      currencyId: it.currencyId,
      tranDate,
      amount: it.amount,
      branchId,
    })
  }
  return list
}
// Find
export const fetchCashDepositEmp = new ValidatedMethod({
  name: 'ex.fetchCashDepositEmp',
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
      const data = await CashDeposit.aggregate([
        {
          $match: selector,
        },
        {
          $lookup: {
            from: 'app_employees',
            localField: 'employeeId',
            foreignField: '_id',
            as: 'employeeDoc',
          },
        },
        {
          $unwind: {
            path: '$employeeDoc',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $group: {
            _id: '$employeeId',
            name: { $last: '$employeeDoc.name' },
          },
        },
        {
          $sort: { name: 1 },
        },
      ]).allowDiskUse(true)
      return data
    }
  },
})
// get Cash Deposit
export const DepositCurrencyBalance = new ValidatedMethod({
  name: 'ex.DepositCurrencyBalance',
  mixins: [CallPromiseMixin],
  validate: new SimpleSchema({
    selector: {
      type: Object,
      blackbox: true,
      optional: true,
    },
    cashId: {
      type: String,
      optional: true,
    },
  }).validator(),
  async run({ selector, cashId }) {
    if (Meteor.isServer) {
      selector = selector || {}
      let currentMatch = {
        branchId: selector.branchId,
        tranDate: {
          $gte: selector.fromDate,
          $lte: selector.toDate,
        },
        $or: [
          { employeeId: selector.employeeId },
          { fromEmployeeId: selector.fromEmployeeId },
        ],
      }
      if (cashId) currentMatch._id = { $ne: cashId }
      //cashDeposit
      const cashDeposit = await CashDeposit.aggregate([
        {
          $match: currentMatch,
        },
        {
          $lookup: {
            from: 'ex_cashDepositDetails',
            localField: '_id',
            foreignField: 'cashId',
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
          $addFields: {
            amount: {
              $cond: [
                { $eq: [{ $ifNull: ['$fromEmployeeId', null] }, null] },
                '$detailsDoc.amount',
                // { $multiply: ['$detailsDoc.amount', -1] }
                {
                  $cond: [
                    { $eq: ['$fromEmployeeId', selector.employeeId] },
                    { $multiply: ['$detailsDoc.amount', -1] },
                    '$detailsDoc.amount',
                  ],
                },
              ],
            },
          },
        },
        {
          $group: {
            _id: '$detailsDoc.currencyId',
            amount: { $sum: '$amount' },
          },
        },
        {
          $addFields: {
            amount: { $toDouble: '$amount' },
          },
        },
      ]).allowDiskUse(true)

      // transaction Ids
      const tranSelector = {
        branchId: selector.branchId,
        tranDate: {
          $gte: selector.fromDate,
          $lte: selector.toDate,
        },
        employeeId: selector.employeeId,
      }
      let tranIds = await Transaction.distinct('_id', tranSelector).lean()
      //match transaction
      let match = {
        transactionId: { $in: tranIds },
      }
      // update
      let matchId = {}
      if (selector._id) {
        matchId.transactionId = { $ne: selector._id }
      }
      //bid transaction (ទិញចូល)
      let amountBid = await TransactionDetails.aggregate([
        {
          $match: match,
        },
        {
          $match: matchId,
        },
        {
          $group: {
            _id: '$baseCurrencyId',
            amount: { $sum: '$exchangeAmount' },
          },
        },
        {
          $addFields: {
            amount: { $toDouble: '$amount' },
          },
        },
      ]).allowDiskUse(true)
      //ask transaction (លក់ចេញ)
      let amountAsk = await TransactionDetails.aggregate([
        {
          $match: match,
        },
        {
          $match: matchId,
        },
        {
          $group: {
            _id: '$toCurrencyId',
            amount: { $sum: '$amount' },
          },
        },
        {
          $addFields: {
            amount: { $multiply: [{ $toDouble: '$amount' }, -1] },
          },
        },
      ]).allowDiskUse(true)

      let data = [...cashDeposit, ...amountBid, ...amountAsk]
      let currencyDocs = await ExchangeCurrency.find({
        branchId: selector.branchId,
      }).lean()

      let list = []
      const loopLength = currencyDocs.length
      for (let i = 0; i < loopLength; i++) {
        const it = currencyDocs[i]
        let details = data.filter((de) => de._id == it._id)
        let row = {
          _id: it._id,
          name: it.name,
          symbol: it.symbol,
          amount: 0,
          order: it.order,
        }

        if (details.length) {
          const detailLength = details.length
          for (let j = 0; j < detailLength; j++) {
            const de = details[j]
            row.amount += de.amount
          }
        }

        list.push(row)
      }
      return _.orderBy(list, ['order'], ['asc'])
    }
  },
})
rateLimit({
  methods: [
    findCashDepositById,
    insertCashDeposit,
    updateCashDeposit,
    removeCashDepositById,
  ],
})
