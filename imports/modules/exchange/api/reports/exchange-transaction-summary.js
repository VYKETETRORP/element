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

export const reportSummaryTransaction = new ValidatedMethod({
  name: 'ex.reportSummaryTransaction',
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
      const match = {
        branchId: { $in: branchId },
        tranDate: {
          $gte: reportDate[0],
          $lte: reportDate[1],
        },
      }
      const parenMatch = {
        branchId: { $in: branchId },
        tranDate: {
          $gte: reportDate[0],
          $lte: reportDate[1],
        },
      }
      if (tranTypeId.length) parenMatch.tranTypeId = { $in: tranTypeId }
      // Check customer
      if (customerId.length) {
        parenMatch.customerId = { $in: customerId }
      }
      // Check Employee
      if (employeeId.length) {
        parenMatch.employeeId = { $in: employeeId }
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

      const tranIds = await Transactions.distinct('_id', parenMatch).lean()
      match.transactionId = { $in: tranIds }
      match.$or = [baseMarch, toMarch]

      let data = await transactionDetails
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
          // {
          //   $project: {
          //     _id: 1,
          //     tranDate: 1,
          //     name: '$customerDoc.name',
          //     tranType: '$transactionDoc.tranType',
          //     refNo: '$transactionDoc.refNo',
          //     providerId: '$providerDoc._id',
          //     currencyId: '$currencyDoc._id',
          //     currency: '$currencyDoc.name',
          //     fromSymbol: '$currencyDoc.fromSymbol',
          //     toSymbol: '$currencyDoc.toSymbol',
          //     received: { $toDouble: '$received' },
          //     exchangeAmount: { $toDouble: '$exchangeAmount' },
          //     amount: { $toDouble: '$amount' },
          //     return: {
          //       $toDouble: { $subtract: ['$received', '$exchangeAmount'] },
          //     },
          //   },
          // },
          // {
          //   $group: {
          //     _id: { baseId: '$baseId', toId: '$toId' },
          //     name: { $last: '$name' },
          //     tranType: { $last: '$tranType' },
          //     refNo: { $last: '$refNo' },
          //     currency: { $last: '$baseName' },
          //     fromSymbol: { $last: '$baseSymbol' },
          //     toSymbol: { $last: '$toSymbol' },
          //     received: { $sum: '$received' },
          //     exchangeAmount: { $sum: '$exchangeAmount' },
          //     amount: { $sum: '$amount' },
          //     return: { $sum: '$return' },
          //   },
          // },
          {
            $project: {
              _id: 1,
              tranDate: 1,
              name: '$customerDoc.name',
              tranType: '$tranTypeDoc.name',
              refNo: '$transactionDoc.refNo',
              employeeName: '$employeeDoc.name',
              baseIdRef: '$baseCurrencyDoc._id',
              toIdRef: '$toCurrencyDoc._id',
              baseNameRef: '$baseCurrencyDoc.name',
              toNameRef: '$toCurrencyDoc.name',
              baseSymbolRef: '$baseCurrencyDoc.symbol',
              toSymbolRef: '$toCurrencyDoc.symbol',
              type: '$type',
              // bid: { $toDouble: '$exchangeRateDetailDoc.bid' },
              // ask: { $toDouble: '$exchangeRateDetailDoc.ask' },
              received: { $toDouble: '$received' },
              exchangeAmount: { $toDouble: '$exchangeAmount' },
              amount: { $toDouble: '$amount' },
              return: { $toDouble: '$return' },
              variate: {
                $toDouble: {
                  $subtract: [
                    '$exchangeRateDetailDoc.ask',
                    '$exchangeRateDetailDoc.bid',
                  ],
                },
              },
              branchId: 1,
            },
          },
          {
            $addFields: {
              baseId: {
                $cond: [{ $eq: ['$type', 'bid'] }, '$baseIdRef', '$toIdRef'],
              },
              toId: {
                $cond: [{ $eq: ['$type', 'bid'] }, '$toIdRef', '$baseIdRef'],
              },
              baseName: {
                $cond: [
                  { $eq: ['$type', 'bid'] },
                  '$baseNameRef',
                  '$toNameRef',
                ],
              },
              toName: {
                $cond: [
                  { $eq: ['$type', 'bid'] },
                  '$toNameRef',
                  '$baseNameRef',
                ],
              },
              baseSymbol: {
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
              netIncome: {
                $cond: [
                  { $eq: ['$type', 'ask'] },
                  { $multiply: ['$variate', '$amount'] },
                  { $subtract: ['$variate', '$variate'] },
                ],
              },
            },
          },
          {
            $group: {
              _id: { baseId: '$baseId', toId: '$toId' },
              name: { $last: '$name' },
              tranType: { $last: '$tranType' },
              refNo: { $last: '$refNo' },
              baseName: { $last: '$baseName' },
              toName: { $last: '$toName' },
              fromSymbol: { $last: '$baseSymbol' },
              toSymbol: { $last: '$toSymbol' },
              received: { $sum: '$received' },
              exchangeAmount: { $sum: '$exchangeAmount' },
              amount: { $sum: '$amount' },
              return: { $sum: '$return' },
              netIncome: { $sum: '$netIncome' },
            },
          },
          {
            $sort: { tranDate: -1, refNo: 1 },
          },
        ])
        .allowDiskUse(true)
      return data
    }
  },
})

rateLimit({
  methods: [reportSummaryTransaction],
})
