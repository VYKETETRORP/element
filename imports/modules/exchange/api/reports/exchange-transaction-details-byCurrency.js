import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { CallPromiseMixin } from 'meteor/didericis:callpromise-mixin'
import SimpleSchema from 'simpl-schema'
import perfy from 'perfy'

import rateLimit from '/imports/api/lib/rate-limit'
import Transactions from '../transaction/transaction'
import transactionDetails from '../transaction/transaction-details'
import ExchangeCurrency from '../exchange-currency/exchange-currency'
// import ExchangeRateDetails from '../exchange-rates/exchange-rate-details'

// Transaction Details by currency
export const reportTransactionDetailsByCurrency = new ValidatedMethod({
  name: 'ex.reportTransactionDetailsByCurrency',
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
      perfy.start('transaction-details-report')
      let match = {
        branchId: { $in: branchId },
        tranDate: {
          $gte: reportDate[0],
          $lte: reportDate[1],
        },
      }
      const parentMatch = {
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
            $lookup: {
              from: 'ex_exchangeRates',
              localField: 'exchangeRateDetailDoc.exchangeRateId',
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
            $lookup: {
              from: 'ex_providers',
              localField: 'exchangeRateDoc.providerId',
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
          // {
          //   $project: {
          //     _id: 1,
          //     tranDate: 1,
          //     name: '$customerDoc.name',
          //     employeeName: '$employeeDoc.name',
          //     tranType: '$transactionDoc.tranType',
          //     refNo: '$transactionDoc.refNo',
          //     refId: '$transactionDoc._id',
          //     providerId: '$providerDoc._id',
          //     currencyId: '$currencyDoc._id',
          //     currency: '$currencyDoc.name',
          //     fromSymbol: '$currencyDoc.fromSymbol',
          //     toSymbol: '$currencyDoc.toSymbol',
          //     rate: { $toDouble: '$exchangeRateDetailDoc.rate' },
          //     received: { $toDouble: '$received' },
          //     exchangeAmount: { $toDouble: '$exchangeAmount' },
          //     amount: { $toDouble: '$amount' },
          //     return: {
          //       $toDouble: { $subtract: ['$received', '$exchangeAmount'] },
          //     },
          //     branchId: 1,
          //   },
          // },
          {
            $project: {
              _id: 1,
              tranDate: 1,
              name: '$customerDoc.name',
              tranType: '$tranTypeDoc.name',
              refNo: '$transactionDoc.refNo',
              refId: '$transactionDoc._id',
              providerId: '$providerDoc._id',
              employeeName: '$employeeDoc.name',
              baseIdRef: '$baseCurrencyDoc._id',
              toIdRef: '$toCurrencyDoc._id',
              baseNameRef: '$baseCurrencyDoc.name',
              toNameRef: '$toCurrencyDoc.name',
              baseSymbolRef: '$baseCurrencyDoc.symbol',
              toSymbolRef: '$toCurrencyDoc.symbol',
              type: '$type',
              bid: { $toDouble: '$exchangeRateDetailDoc.bid' },
              ask: { $toDouble: '$exchangeRateDetailDoc.ask' },
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
              rate: {
                $cond: [{ $eq: ['$type', 'bid'] }, '$bid', '$ask'],
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
            $sort: { tranDate: 1, refNo: 1 },
          },
          {
            $group: {
              _id: { baseId: '$baseId', toId: '$toId', proId: '$providerId' },
              baseName: { $last: '$baseName' },
              toName: { $last: '$toName' },
              totalReceived: { $sum: '$received' },
              totalExchangeAmount: { $sum: '$exchangeAmount' },
              totalAmount: { $sum: '$amount' },
              totalReturn: { $sum: '$return' },
              totalNetIncome: { $sum: '$netIncome' },
              tranDate: { $last: '$tranDate' },
              details: {
                $push: {
                  _id: '$refId',
                  tranDate: '$tranDate',
                  customerName: '$name',
                  employeeName: '$employeeName',
                  tranType: '$tranType',
                  refNo: '$refNo',
                  rate: '$rate',
                  received: '$received',
                  exchangeAmount: '$exchangeAmount',
                  amount: '$amount',
                  return: '$return',
                  type: '$type',
                  fromSymbol: '$baseSymbol',
                  toSymbol: '$toSymbol',
                  branchId: '$branchId',
                  netIncome: '$netIncome',
                },
              },
              fromSymbol: { $last: '$baseSymbol' },
              toSymbol: { $last: '$toSymbol' },
            },
          },
          // {
          //   $sort: { tranDate: 1, refNo: 1 },
          // },
        ])
        .allowDiskUse(true)
      data.forEach((obj) => {
        obj.details.forEach((item) => {
          if (
            (item.fromSymbol == '$' && item.toSymbol == '៛') ||
            (item.fromSymbol == '៛' && item.toSymbol == '$') ||
            (item.fromSymbol == '៛' && item.toSymbol == '฿') ||
            (item.fromSymbol == '฿' && item.toSymbol == '៛')
          ) {
            item.rateFormat = '៛'
          } else if (
            (item.fromSymbol == '฿' && item.toSymbol == '$') ||
            (item.fromSymbol == '$' && item.toSymbol == '฿')
          ) {
            item.rateFormat = '฿'
          }
        })
      })
      return data
    }
  },
})
rateLimit({
  methods: [reportTransactionDetailsByCurrency],
})
