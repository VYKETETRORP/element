import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { CallPromiseMixin } from 'meteor/didericis:callpromise-mixin'
import SimpleSchema from 'simpl-schema'
import perfy from 'perfy'

import rateLimit from '/imports/api/lib/rate-limit'
import CashDeposit from '../cash-deposit/cash-deposit'
import transaction from '../transaction/transaction.js'
import transactionDetails from '../transaction/transaction-details'
import ExchangeCurrency from '../exchange-currency/exchange-currency'
import Employee from '../../../../api/employees/employees'

export const reportTransactionEmployeeDetails = new ValidatedMethod({
  name: 'ex.reportTransactionEmployeeDetails',
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
      perfy.start('transaction-employee-details-report')
      let list = []
      let match = {
        branchId: { $in: branchId },
        tranDate: {
          $gte: reportDate[0],
          $lte: reportDate[1],
        },
      }
      // Check Employee
      let empMatch = {}
      if (employeeId.length) {
        empMatch.employeeId = { $in: employeeId }
      }
      // check currency
      let curMatch = {}
      if (currencyId.length) {
        let curencyId = await ExchangeCurrency.distinct('_id', {
          _id: { $in: currencyId },
        }).lean()
        curMatch['detailsDoc.currencyId'] = { $in: curencyId }
      }

      let openCash = await CashDeposit.aggregate([
        {
          $match: match,
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
          $match: { tranType: 'Deposit' },
        },
        {
          $match: empMatch,
        },
        {
          $match: curMatch,
        },
        {
          $group: {
            _id: { curencyId: '$detailsDoc.currencyId', emp: '$employeeId' },
            id: { $last: '$detailsDoc.currencyId' },
            empId: { $last: '$employeeId' },
            amountOpen: { $sum: '$detailsDoc.amount' },
          },
        },
        {
          $addFields: {
            amountOpen: { $toDouble: '$amountOpen' },
          },
        },
      ]).allowDiskUse(true)
      // Transfer In
      let transferIn = await CashDeposit.aggregate([
        {
          $match: match,
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
          $match: { tranType: 'Transfer' },
        },
        {
          $match: curMatch,
        },
        {
          $group: {
            _id: { currency: '$detailsDoc.currencyId', emp: '$employeeId' },
            id: { $last: '$detailsDoc.currencyId' },
            empId: { $last: '$employeeId' },
            amountTranIn: { $sum: '$detailsDoc.amount' },
          },
        },
        {
          $addFields: {
            amountTranIn: { $toDouble: '$amountTranIn' },
          },
        },
      ]).allowDiskUse(true)
      // Transfer Out
      let transferOut = await CashDeposit.aggregate([
        {
          $match: match,
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
          $match: { tranType: 'Transfer' },
        },
        {
          $match: curMatch,
        },
        {
          $group: {
            _id: {
              currency: '$detailsDoc.currencyId',
              emp: '$fromEmployeeId',
            },
            id: { $last: '$detailsDoc.currencyId' },
            empId: { $last: '$fromEmployeeId' },
            amountTranOut: { $sum: '$detailsDoc.amount' },
          },
        },
        {
          $addFields: {
            amountTranOut: { $toDouble: '$amountTranOut' },
          },
        },
      ]).allowDiskUse(true)
      // Find parent ids
      let parentMatch = {
        branchId: { $in: branchId },
        tranDate: {
          $gte: reportDate[0],
          $lte: reportDate[1],
        },
      }
      // Check Employee
      if (employeeId.length) {
        parentMatch.employeeId = { $in: employeeId }
      }
      // Check Customer
      if (customerId.length) {
        parentMatch.customerId = { $in: customerId }
      }
      if (tranTypeId.length) parentMatch.tranTypeId = { $in: tranTypeId }

      let tranIds = await transaction.distinct('_id', parentMatch)

      let tranMatch = {
        transactionId: { $in: tranIds },
      }
      // Get Bid (ទិញចូល)
      let amountBid = await transactionDetails
        .aggregate([
          {
            $match: tranMatch,
          },
          {
            $lookup: {
              from: 'ex_transaction',
              localField: 'transactionId',
              foreignField: '_id',
              as: 'tranDoc',
            },
          },
          {
            $unwind: {
              path: '$tranDoc',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $group: {
              _id: { baseId: '$baseCurrencyId', emp: '$tranDoc.employeeId' },
              id: { $last: '$baseCurrencyId' },
              empId: { $last: '$tranDoc.employeeId' },
              amountBid: {
                $sum: '$exchangeAmount',
              },
              amountReturn: {
                $sum: '$return',
              },
            },
          },
          {
            $addFields: {
              amountBid: { $toDouble: '$amountBid' },
              amountReturn: { $toDouble: '$amountReturn' },
            },
          },
        ])
        .allowDiskUse(true)

      // Get ask (លក់ចេញ)
      let amountAsk = await transactionDetails
        .aggregate([
          {
            $match: tranMatch,
          },
          {
            $lookup: {
              from: 'ex_transaction',
              localField: 'transactionId',
              foreignField: '_id',
              as: 'tranDoc',
            },
          },
          {
            $unwind: {
              path: '$tranDoc',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $group: {
              _id: { toId: '$toCurrencyId', emp: '$tranDoc.employeeId' },
              id: { $last: '$toCurrencyId' },
              empId: { $last: '$tranDoc.employeeId' },
              amountAsk: { $sum: '$amount' },
            },
          },
          {
            $addFields: {
              amountAsk: { $toDouble: '$amountAsk' },
            },
          },
        ])
        .allowDiskUse(true)

      // Get amount net
      let amountNet = await transactionDetails
        .aggregate([
          {
            $match: tranMatch,
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
              empId: '$transactionDoc.employeeId',
              baseIdRef: '$exchangeRateDetailDoc.baseExchangeCurrencyId',
              toIdRef: '$exchangeRateDetailDoc.toExchangeCurrencyId',
              type: '$type',
              amount: { $toDouble: '$amount' },
              variate: {
                $toDouble: {
                  $subtract: [
                    '$exchangeRateDetailDoc.ask',
                    '$exchangeRateDetailDoc.bid',
                  ],
                },
              },
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
              _id: { baseId: '$baseId', emp: '$empId' },
              id: { $last: '$baseId' },
              empId: { $last: '$empId' },
              amountNet: { $sum: '$netIncome' },
            },
          },
        ])
        .allowDiskUse(true)
      let data = [
        ...openCash,
        ...transferIn,
        ...transferOut,
        ...amountBid,
        ...amountAsk,
        ...amountNet,
      ]

      // check currency
      let currencyMatch = {}
      if (currencyId.length) {
        let curencyId = await ExchangeCurrency.distinct('_id', {
          _id: { $in: currencyId },
        }).lean()
        currencyMatch._id = { $in: curencyId }
      }
      // Check Employee
      let empId = []
      for (let emp of data) {
        empId.push(emp.empId)
      }
      let docEmpMatch = {
        _id: { $in: empId },
      }
      if (employeeId.length) {
        docEmpMatch._id = { $in: employeeId }
      }
      let currencyDocs = await ExchangeCurrency.find(currencyMatch).lean()
      let employeeDocs = await Employee.find(docEmpMatch).lean()
      const totalBalance = []
      for (let emp of employeeDocs) {
        let doc = {
          empName: `${emp.code}:${emp.name}`,
          details: [],
        }
        for (let it of currencyDocs) {
          let docs = data.filter((de) => de.id == it._id && de.empId == emp._id)
          let row = {
            name: it.name,
            symbol: it.symbol,
            amountOpen: 0,
            amountTranIn: 0,
            amountTranOut: 0,
            amountBid: 0,
            amountReturn: 0,
            amountAsk: 0,
            amountNet: 0,
            balance: 0,
          }
          if (docs.length) {
            for (let de of docs) {
              row.amountOpen += de?.amountOpen ?? 0
              row.amountTranIn += de?.amountTranIn ?? 0
              row.amountTranOut += de?.amountTranOut ?? 0
              row.amountBid += de?.amountBid ?? 0
              row.amountAsk += de?.amountAsk ?? 0
              row.amountNet += de?.amountNet ?? 0
              row.amountReturn += de?.amountReturn ?? 0
            }
          }
          // លុយចូល (+)
          const tranIn = row.amountOpen + row.amountTranIn + row.amountBid
          // + row.amountNet
          // លុយចេញ (-)
          const tranOut = row.amountAsk + row.amountTranOut
          row.balance = tranIn - tranOut

          const exist = totalBalance.find((tb) => tb._id == it._id)
          if (exist) {
            exist.value += row.balance
          } else {
            totalBalance.push({
              _id: it._id,
              name: it.name,
              symbol: it.symbol,
              order: it.order,
              value: row.balance,
            })
          }

          doc.details.push(row)
        }
        list.push(doc)
      }
      return { list, totalBalance }
    }
  },
})
rateLimit({
  methods: [reportTransactionEmployeeDetails],
})
