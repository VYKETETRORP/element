import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { CallPromiseMixin } from 'meteor/didericis:callpromise-mixin'
import SimpleSchema from 'simpl-schema'

import throwError from '/imports/api/lib/throwError'
import rateLimit from '/imports/api/lib/rate-limit'

import Transaction from './transaction'
import TransactionDetails from './transaction-details'
import { transactionSchema, transactionDetailSchema } from './schema'

// Find
export const customerCenter = new ValidatedMethod({
  name: 'ex.customerCenter',
  mixins: [CallPromiseMixin],
  validate: new SimpleSchema({
    selector: {
      type: Object,
      blackbox: true,
      optional: true,
    },
    query: {
      type: Object,
      blackbox: true,
      optional: true,
    },
  }).validator(),
  async run({ selector, query }) {
    if (Meteor.isServer) {
      this.unblock()
      // Meteor._sleepForMs(200)
      selector = selector || {}
      let data = []
      // let sort = { tranDate: 1 }
      let skip = (query.page - 1) * query.pageSize
      let limit = query.pageSize
      let firstMatch = {
        branchId: selector.branchId,
        tranDate: selector.tranDate,
      }
      const list = await TransactionDetails.aggregate([
        {
          $match: firstMatch,
        },

        {
          $lookup: {
            from: 'ex_transaction',
            localField: 'transactionId',
            foreignField: '_id',
            as: 'transactionDoc',
          },
        },
        {
          $unwind: {
            path: '$transactionDoc',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: 'ex_tranTypes',
            localField: 'transactionDoc.tranTypeId',
            foreignField: '_id',
            as: 'tranTypeDoc',
          },
        },
        {
          $unwind: {
            path: '$tranTypeDoc',
            preserveNullAndEmptyArrays: true,
          },
        },

        {
          $lookup: {
            from: 'ex_customers',
            localField: 'transactionDoc.customerId',
            foreignField: '_id',
            as: 'customerDoc',
          },
        },
        {
          $unwind: {
            path: '$customerDoc',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: 'ex_exchangeRateDetails',
            localField: 'exchangeRateDetailId',
            foreignField: '_id',
            as: 'exchangeRateDetailDoc',
          },
        },
        {
          $unwind: {
            path: '$exchangeRateDetailDoc',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: 'ex_exchangeCurrency',
            localField: 'exchangeRateDetailDoc.baseExchangeCurrencyId',
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
            localField: 'exchangeRateDetailDoc.toExchangeCurrencyId',
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
            _id: '$_id',
            id: { $last: '$transactionDoc._id' },
            refNo: { $last: '$transactionDoc.refNo' },
            tranDate: { $last: '$tranDate' },
            tranType: { $last: '$tranTypeDoc.name' },
            tranTypeId: { $last: '$transactionDoc.tranTypeId' },
            customerName: { $last: '$customerDoc.name' },
            customerId: { $last: '$customerDoc._id' },
            baseName: { $last: '$baseCurrencyDoc.name' },
            toName: { $last: '$toCurrencyDoc.name' },
            baseSymbol: { $last: '$baseCurrencyDoc.symbol' },
            toSymbol: { $last: '$toCurrencyDoc.symbol' },
            received: { $last: '$received' },
            exchangeAmount: { $last: '$exchangeAmount' },
            amount: { $last: '$amount' },
            return: { $last: '$return' },
            branchId: { $last: '$branchId' },
            type: { $last: '$type' },
          },
        },
        {
          $sort: { tranDate: -1, refNo: -1 },
        },
        { $skip: skip },
        { $limit: limit },
        {
          $addFields: {
            return: { $toDouble: '$return' },
            received: { $toDouble: '$received' },
            exchangeAmount: { $toDouble: '$exchangeAmount' },
            amount: { $toDouble: '$amount' },
          },
        },
        {
          $match: selector,
        },
      ]).allowDiskUse(true)
      for (let it of list) {
        if (it.type === 'bid') {
          data.push({
            _id: it._id,
            id: it.id,
            refNo: it.refNo,
            tranDate: it.tranDate,
            tranType: it.tranType,
            tranTypeId: it.tranTypeId,
            customerName: it.customerName,
            customerId: it.customerId,
            baseName: it.baseName,
            toName: it.toName,
            currency: `${it.baseName}-${it.toName}`,
            baseSymbol: it.baseSymbol,
            toSymbol: it.toSymbol,
            received: it.received,
            exchangeAmount: it.exchangeAmount,
            amount: it.amount,
            branchId: it.branchId,
            type: it.type,
            return: it.return,
          })
        } else {
          data.push({
            _id: it._id,
            id: it.id,
            refNo: it.refNo,
            tranDate: it.tranDate,
            tranType: it.tranType,
            tranTypeId: it.tranTypeId,
            customerName: it.customerName,
            customerId: it.customerId,
            baseName: it.toName,
            toName: it.baseName,
            currency: `${it.toName}-${it.baseName}`,
            baseSymbol: it.toSymbol,
            toSymbol: it.baseSymbol,
            received: it.received,
            exchangeAmount: it.exchangeAmount,
            amount: it.amount,
            branchId: it.branchId,
            type: it.type,
            return: it.return,
          })
        }
      }
      return { data, total: data.length }
    }
  },
})
// Invoice
export const getInvoice = new ValidatedMethod({
  name: 'ex.getInvoice',
  mixins: [CallPromiseMixin],
  validate: new SimpleSchema({
    _id: String,
  }).validator(),
  async run(_id) {
    if (Meteor.isServer) {
      try {
        let data = await Transaction.aggregate([
          {
            $match: _id,
          },
          {
            $lookup: {
              from: 'ex_customers',
              localField: 'customerId',
              foreignField: '_id',
              as: 'customerDoc',
            },
          },
          {
            $unwind: {
              path: '$customerDoc',
              preserveNullAndEmptyArrays: true,
            },
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
            $lookup: {
              from: 'app_branches',
              localField: 'branchId',
              foreignField: '_id',
              as: 'branchDoc',
            },
          },
          {
            $unwind: {
              path: '$branchDoc',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $lookup: {
              from: 'ex_transactionDetails',
              localField: '_id',
              foreignField: 'transactionId',
              as: 'transactionDetailsDoc',
            },
          },
          {
            $unwind: {
              path: '$transactionDetailsDoc',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $lookup: {
              from: 'ex_exchangeRateDetails',
              localField: 'transactionDetailsDoc.exchangeRateDetailId',
              foreignField: '_id',
              as: 'exchangeRateDetailDoc',
            },
          },
          {
            $unwind: {
              path: '$exchangeRateDetailDoc',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $lookup: {
              from: 'ex_exchangeCurrency',
              localField: 'exchangeRateDetailDoc.exchangeCurrencyId',
              foreignField: '_id',
              as: 'exchangeCurrencyDoc',
            },
          },
          {
            $unwind: {
              path: '$exchangeCurrencyDoc',
              preserveNullAndEmptyArrays: true,
            },
          },
          // Base
          {
            $lookup: {
              from: 'ex_exchangeCurrency',
              localField: 'exchangeRateDetailDoc.baseExchangeCurrencyId',
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
          // To
          {
            $lookup: {
              from: 'ex_exchangeCurrency',
              localField: 'exchangeRateDetailDoc.toExchangeCurrencyId',
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
              _id: 1,
              tranDate: 1,
              tranType: '$tranType',
              refNo: '$refNo',
              customer: '$customerDoc.name',
              employeeName: '$employeeDoc.name',
              baseIdRef: '$baseCurrencyDoc._id',
              toIdRef: '$toCurrencyDoc._id',
              baseNameRef: '$baseCurrencyDoc.name',
              toNameRef: '$toCurrencyDoc.name',
              baseSymbolRef: '$baseCurrencyDoc.symbol',
              toSymbolRef: '$toCurrencyDoc.symbol',
              type: '$transactionDetailsDoc.type',
              bid: { $toDouble: '$exchangeRateDetailDoc.bid' },
              ask: { $toDouble: '$exchangeRateDetailDoc.ask' },
              received: { $toDouble: '$transactionDetailsDoc.received' },
              exchangeAmount: {
                $toDouble: '$transactionDetailsDoc.exchangeAmount',
              },
              amount: { $toDouble: '$transactionDetailsDoc.amount' },
              return: { $toDouble: '$transactionDetailsDoc.return' },
              // return: {
              //   $toDouble: {
              //     $subtract: [
              //       '$transactionDetailsDoc.received',
              //       '$transactionDetailsDoc.exchangeAmount',
              //     ],
              //   },
              // },
              enBusinessName: '$branchDoc.shortName',
              address: '$branchDoc.address',
              telephone: '$branchDoc.telephone',
              email: '$branchDoc.email',
              branchDoc: '$branchDoc',
            },
          },
          {
            $addFields: {
              // fromId: {
              //   $cond: [{ $eq: ['$type', 'bid'] }, '$baseIdRef', '$toIdRef'],
              // },
              // toId: {
              //   $cond: [{ $eq: ['$type', 'bid'] }, '$toIdRef', '$baseIdRef'],
              // },
              // baseName: {
              //   $cond: [
              //     { $eq: ['$type', 'bid'] },
              //     '$baseNameRef',
              //     '$toNameRef',
              //   ],
              // },
              // toName: {
              //   $cond: [
              //     { $eq: ['$type', 'bid'] },
              //     '$toNameRef',
              //     '$baseNameRef',
              //   ],
              // },
              fromSymbol: {
                $cond: [
                  { $eq: ['$type', 'bid'] },
                  '$baseSymbolRef',
                  '$toSymbolRef',
                ],
              },
              toSymbol: {
                $cond: [
                  { $eq: ['$type', 'bid'] },
                  '$toSymbolRef',
                  '$baseSymbolRef',
                ],
              },
              rate: {
                $cond: [{ $eq: ['$type', 'bid'] }, '$bid', '$ask'],
              },
            },
          },
          {
            $group: {
              _id: '$_id',
              refNo: { $last: '$refNo' },
              tranType: { $last: '$tranType' },
              tranDate: { $last: '$tranDate' },
              customer: { $last: '$customer' },
              employeeName: { $last: '$employeeName' },
              branchDoc: { $last: '$branchDoc' },
              enBusinessName: { $last: '$enBusinessName' },
              address: { $last: '$address' },
              telephone: { $last: '$telephone' },
              email: { $last: '$email' },
              details: {
                $push: {
                  // name: '$baseName',
                  fromSymbol: '$fromSymbol',
                  toSymbol: '$toSymbol',
                  rate: '$rate',
                  received: '$received',
                  exchangeAmount: '$exchangeAmount',
                  amount: '$amount',
                  return: '$return',
                },
              },
            },
          },
        ])
        data = data[0]
        data.details.forEach((obj) => {
          if (
            (obj.fromSymbol == '$' && obj.toSymbol == '៛') ||
            (obj.fromSymbol == '៛' && obj.toSymbol == '$') ||
            (obj.fromSymbol == '៛' && obj.toSymbol == '฿') ||
            (obj.fromSymbol == '฿' && obj.toSymbol == '៛')
          ) {
            obj.rateFormat = '៛'
          } else if (
            (obj.fromSymbol == '฿' && obj.toSymbol == '$') ||
            (obj.fromSymbol == '$' && obj.toSymbol == '฿')
          ) {
            obj.rateFormat = '฿'
          }
        })
        data.details = data.details[0]
        return data
      } catch (err) {
        console.log('Error', err)
        throwError('Find Invoice by id error', err)
      }
    }
  },
})
// Find One refNo
export const findOneTransaction = new ValidatedMethod({
  name: 'pos.findOneTransaction',
  mixins: [CallPromiseMixin],
  validate: null,
  async run({ selector, options }) {
    if (Meteor.isServer) {
      // Meteor._sleepForMs(200)
      selector = selector || {}
      options = options || {}
      let data = await Transaction.findOne(selector, options).lean()
      return data
      // return Customers.findOne(selector, options)
    }
  },
})
// Find One
export const findTransactionById = new ValidatedMethod({
  name: 'ex.findTransactionById',
  mixins: [CallPromiseMixin],
  validate: new SimpleSchema({
    _id: String,
  }).validator(),
  async run(_id) {
    if (Meteor.isServer) {
      try {
        let details = []
        let doc = await Transaction.findOne({ _id }).lean()
        if (!doc) throw `This transaction deleted!`
        let list = []
        if (doc) {
          delete doc.__v
          list = await TransactionDetails.aggregate([
            {
              $match: { transactionId: _id._id },
            },
            {
              $lookup: {
                from: 'ex_exchangeRateDetails',
                localField: 'exchangeRateDetailId',
                foreignField: '_id',
                as: 'exchangeRateDetailDoc',
              },
            },
            {
              $unwind: {
                path: '$exchangeRateDetailDoc',
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $lookup: {
                from: 'ex_exchangeCurrency',
                localField: 'exchangeRateDetailDoc.baseExchangeCurrencyId',
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
                localField: 'exchangeRateDetailDoc.toExchangeCurrencyId',
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
            //   $project: {
            //     transactionId: 1,
            //     exchangeRateDetailId: 1,
            //     currencyName: '$exchangeCurrencyDoc.name',
            //     baseSymbol: '$baseCurrencyDoc.symbol',
            //     toSymbol: '$toCurrencyDoc.symbol',
            //     bid: { $toDouble: '$exchangeRateDetailDoc.bid' },
            //     ask: { $toDouble: '$exchangeRateDetailDoc.ask' },
            //     tranDate: 1,
            //     received: { $toDouble: '$received' },
            //     exchangeAmount: { $toDouble: '$exchangeAmount' },
            //     amount: { $toDouble: '$amount' },
            //     return: { $subtract: ['$received', '$exchangeAmount'] },
            //     exchangeId: {
            //       $concat: ['$baseCurrencyDoc._id', '-', '$toCurrencyDoc._id'],
            //     },
            //   },
            // },
            // {
            //   $addFields: {
            //     return: { $toDouble: '$return' },
            //   },
            // },
            {
              $project: {
                transactionId: 1,
                exchangeRateDetailId: 1,
                // currencyName: '$exchangeCurrencyDoc.name',
                baseSymbol: '$baseCurrencyDoc.symbol',
                toSymbol: '$toCurrencyDoc.symbol',
                baseName: '$baseCurrencyDoc.name',
                toName: '$toCurrencyDoc.name',
                baseCurrencyId: '$baseCurrencyDoc._id',
                toCurrencyId: '$toCurrencyDoc._id',
                bid: { $toDouble: '$exchangeRateDetailDoc.bid' },
                ask: { $toDouble: '$exchangeRateDetailDoc.ask' },
                type: '$type',
                tranDate: 1,
                received: { $toDouble: '$received' },
                exchangeAmount: { $toDouble: '$exchangeAmount' },
                amount: { $toDouble: '$amount' },
                return: { $toDouble: '$return' },
                // return: { $subtract: ['$received', '$exchangeAmount'] },
                // exchangeId: {
                //   $concat: ['$baseCurrencyDoc._id', '-', '$toCurrencyDoc._id'],
                // },
              },
            },
            {
              $addFields: {
                return: { $toDouble: '$return' },
              },
            },
          ]).allowDiskUse(true)
          for (let it of list) {
            if (it.type == 'bid') {
              details.push({
                _id: it._id,
                transactionId: it.transactionId,
                exchangeRateDetailId: it.exchangeRateDetailId,
                currencyName: `${it.baseName}-${it.toName}  (${it.bid})`,
                tranDate: it.tranDate,
                baseSymbol: it.baseSymbol,
                toSymbol: it.toSymbol,
                baseName: it.baseName,
                toName: it.toName,
                baseCurrencyId: it.baseCurrencyId,
                toCurrencyId: it.toCurrencyId,
                bid: it.bid,
                ask: it.ask,
                type: it.type,
                received: it.received,
                exchangeAmount: it.exchangeAmount,
                amount: it.amount,
                return: it.return,
                exchangeId: `${it.baseCurrencyId}-${it.toCurrencyId}`,
              })
            } else {
              details.push({
                _id: it._id,
                transactionId: it.transactionId,
                exchangeRateDetailId: it.exchangeRateDetailId,
                currencyName: `${it.toName}-${it.baseName}  (${it.ask})`,
                tranDate: it.tranDate,
                baseSymbol: it.toSymbol,
                toSymbol: it.baseSymbol,
                baseName: it.toName,
                toName: it.baseName,
                baseCurrencyId: it.toCurrencyId,
                toCurrencyId: it.baseCurrencyId,
                bid: it.bid,
                ask: it.ask,
                type: it.type,
                received: it.received,
                exchangeAmount: it.exchangeAmount,
                amount: it.amount,
                return: it.return,
                exchangeId: `${it.toCurrencyId}-${it.baseCurrencyId}`,
              })
            }
          }
        }
        return { doc, details }
      } catch (err) {
        console.log('Error', err)
        throwError('Find Transacttion by id error', err)
      }
    }
  },
})

// Insert
export const insertTransaction = new ValidatedMethod({
  name: 'ex.insertTransaction',
  mixins: [CallPromiseMixin],
  validate: new SimpleSchema({
    doc: transactionSchema,
    details: {
      type: Array,
    },
    'details.$': transactionDetailSchema,
  }).validator(),
  async run({ doc, details }) {
    if (Meteor.isServer) {
      try {
        let parentDoc = new Transaction(doc)
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
          await TransactionDetails.insertMany(list)
        }

        return res.id
      } catch (err) {
        console.log('Error', err)
        throwError('Insert Transaction error', err)
      }
    }
  },
})

// Update
export const updateTransaction = new ValidatedMethod({
  name: 'ex.updateTransaction',
  mixins: [CallPromiseMixin],
  validate: new SimpleSchema({
    doc: transactionSchema,
    details: {
      type: Array,
    },
    'details.$': transactionDetailSchema,
  }).validator(),
  async run({ doc, details }) {
    if (Meteor.isServer) {
      try {
        const parentId = doc._id
        const tranDate = doc.tranDate
        const branchId = doc.branchId
        let preDoc = await Transaction.findOne({ _id: parentId }).lean()
        if (!preDoc) throw `This transaction deleted!`

        // Remove details
        if (parentId)
          await TransactionDetails.deleteMany({ transactionId: parentId })

        // Update
        let res = await Transaction.updateOne({ _id: parentId }, { $set: doc })

        // Pick up details
        let list = pickupDetails({ details, parentId, tranDate, branchId })
        // Insert details
        if (list.length) {
          await TransactionDetails.insertMany(list)
        }

        return parentId
      } catch (err) {
        console.log('Error', err)
        throwError('Update Transaction error', err)
      }
    }
  },
})

// Update
export const removeTransactionById = new ValidatedMethod({
  name: 'ex.removeTransactionById',
  mixins: [CallPromiseMixin],
  validate: new SimpleSchema({
    _id: String,
  }).validator(),
  async run(_id) {
    if (Meteor.isServer) {
      try {
        let preDoc = await Transaction.findOne({ _id }).lean()
        if (!preDoc) throw `This transaction deleted!`

        let res = await Transaction.deleteOne({ _id })

        res = await TransactionDetails.deleteMany({ transactionId: _id._id })

        return res
      } catch (err) {
        console.log('Error', err)
        throwError('Remove Transaction error', err)
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
      transactionId: parentId,
      exchangeRateDetailId: it.exchangeRateDetailId,
      tranDate,
      received: it.received,
      exchangeAmount: it.exchangeAmount,
      amount: it.amount,
      return: it.return,
      type: it.type,
      baseCurrencyId: it.baseCurrencyId,
      toCurrencyId: it.toCurrencyId,
      branchId,
    })
  }
  return list
}

// Check Customer Length
export const findCustomerLengths = new ValidatedMethod({
  name: 'ex.findCustomerLengths',
  mixins: [CallPromiseMixin],
  validate: new SimpleSchema({
    _id: String,
  }).validator(),
  async run({ _id }) {
    if (Meteor.isServer) {
      return await Transaction.find({ customerId: _id }).count()
    }
  },
})

// Check RateDatail Length
export const findRateDeialLengths = new ValidatedMethod({
  name: 'ex.findRateDeialLengths',
  mixins: [CallPromiseMixin],
  validate: new SimpleSchema({
    _id: String,
  }).validator(),
  async run({ _id }) {
    if (Meteor.isServer) {
      const data = TransactionDetails.aggregate([
        {
          $lookup: {
            from: 'ex_exchangeRateDetails',
            localField: 'exchangeRateDetailId',
            foreignField: '_id',
            as: 'exchangeRateDetailDoc',
          },
        },
        {
          $unwind: {
            path: '$exchangeRateDetailDoc',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            exchangeRateId: '$exchangeRateDetailDoc.exchangeRateId',
          },
        },
        {
          $match: { exchangeRateId: _id },
        },
      ])
      return data
    }
  },
})

rateLimit({
  methods: [
    customerCenter,
    findTransactionById,
    getInvoice,
    insertTransaction,
    updateTransaction,
    removeTransactionById,
  ],
})
