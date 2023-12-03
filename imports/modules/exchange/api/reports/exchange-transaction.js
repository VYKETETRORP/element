import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { CallPromiseMixin } from 'meteor/didericis:callpromise-mixin'
import SimpleSchema from 'simpl-schema'
import perfy from 'perfy'

import rateLimit from '/imports/api/lib/rate-limit'
import Transactions from '../transaction/transaction'
import transactionDetails from '../transaction/transaction-details'
// import ExchangeRateDetails from '../exchange-rates/exchange-rate-details'
import ExchangeCurrency from '../exchange-currency/exchange-currency'

export const reportTrasaction = new ValidatedMethod({
  name: 'ex.reportTrasaction',
  mixins: [CallPromiseMixin],
  validate: new SimpleSchema({
    reportDate: Array,
    'reportDate.$': Date,
    branchId: Array,
    'branchId.$': String,
    customerId: {
      type: Array,
      optional: true,
    },
    'customerId.$': String,
    currencyId: {
      type: Array,
      optional: true,
    },
    'currencyId.$': String,
    employeeId: {
      type: Array,
      optional: true,
    },
    'employeeId.$': String,
    tranTypeId: {
      type: Array,
      optional: true,
    },
    'tranTypeId.$': String,
  }).validator(),
  async run({
    branchId,
    currencyId,
    customerId,
    employeeId,
    reportDate,
    tranTypeId,
  }) {
    if (Meteor.isServer) {
      this.unblock()
      perfy.start('transaction-report')
      let match = {
        branchId: { $in: branchId },
        tranDate: {
          $gte: reportDate[0],
          $lte: reportDate[1],
        },
      }
      let parentMatch = {
        branchId: { $in: branchId },
        tranDate: {
          $gte: reportDate[0],
          $lte: reportDate[1],
        },
      }
      if (tranTypeId.length) parentMatch.tranTypeId = { $in: tranTypeId }
      // Check customer
      if (customerId.length) {
        parentMatch.customerId = { $in: customerId }
      }
      // Check Employee
      if (employeeId.length) {
        parentMatch.employeeId = { $in: employeeId }
      }
      // check currency
      let baseMarch = {}
      if (currencyId.length) {
        let baseId = await ExchangeCurrency.distinct('_id', {
          _id: { $in: currencyId },
        }).lean()
        baseMarch.baseCurrencyId = { $in: baseId }
      }
      let toMarch = {}
      if (currencyId.length) {
        let baseId = await ExchangeCurrency.distinct('_id', {
          _id: { $in: currencyId },
        }).lean()
        toMarch.toCurrencyId = { $in: baseId }
      }

      const tranIds = await Transactions.distinct('_id', parentMatch).lean()
      match.transactionId = { $in: tranIds }
      match.$or = [baseMarch, toMarch]
      let transaction = await transactionDetails
        .aggregate([
          {
            $match: match,
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
              from: 'app_employees',
              localField: 'transactionDoc.employeeId',
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
              _id: '$transactionDoc._id',
              tranDate: 1,
              name: '$customerDoc.name',
              tranType: '$tranTypeDoc.name',
              refNo: '$transactionDoc.refNo',
              employeeName: '$employeeDoc.name',
              baseName: '$baseCurrencyDoc.name',
              toName: '$toCurrencyDoc.name',
              baseSymbol: '$baseCurrencyDoc.symbol',
              toSymbol: '$toCurrencyDoc.symbol',
              type: '$type',
              bid: { $toDouble: '$exchangeRateDetailDoc.bid' },
              ask: { $toDouble: '$exchangeRateDetailDoc.ask' },
              received: { $toDouble: '$received' },
              exchangeAmount: { $toDouble: '$exchangeAmount' },
              amount: { $toDouble: '$amount' },
              return: { $toDouble: '$return' },
              // return: {
              //   $toDouble: { $subtract: ['$received', '$exchangeAmount'] },
              // },
              branchId: 1,
            },
          },
          {
            $sort: { tranDate: 1, refNo: 1 },
          },
        ])
        .allowDiskUse(true)

      let data = []
      for (let it of transaction) {
        if (it.type === 'bid') {
          data.push({
            id: it._id,
            refNo: it.refNo,
            tranDate: it.tranDate,
            tranType: it.tranType,
            name: it.name,
            employeeName: it.employeeName,
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
            rate: it.bid,
          })
        } else {
          data.push({
            _id: it._id,
            id: it.id,
            refNo: it.refNo,
            tranDate: it.tranDate,
            tranType: it.tranType,
            name: it.name,
            employeeName: it.employeeName,
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
            rate: it.ask,
            netIncome: (it.ask - it.bid) * it.amount,
          })
        }
      }
      data.forEach((obj) => {
        if (
          (obj.baseSymbol == '$' && obj.toSymbol == '៛') ||
          (obj.baseSymbol == '៛' && obj.toSymbol == '$') ||
          (obj.baseSymbol == '៛' && obj.toSymbol == '฿') ||
          (obj.baseSymbol == '฿' && obj.toSymbol == '៛')
        ) {
          obj.rateFormat = '៛'
        } else if (
          (obj.baseSymbol == '฿' && obj.toSymbol == '$') ||
          (obj.baseSymbol == '$' && obj.toSymbol == '฿')
        ) {
          obj.rateFormat = '฿'
        }
      })
      return data
    }
  },
})
rateLimit({
  methods: [reportTrasaction],
})
