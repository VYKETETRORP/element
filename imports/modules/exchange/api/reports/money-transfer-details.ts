import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { CallPromiseMixin } from 'meteor/didericis:callpromise-mixin'
import SimpleSchema from 'simpl-schema'

import rateLimit from '/imports/api/lib/rate-limit'
import MoneyTransfer from '/imports/modules/exchange/api/money-transfers/money-transfer'

export const reportMoneyTransferDetails = new ValidatedMethod({
  name: 'ex.reportMoneyTransferDetails',
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
    tranType: {
      type: Array,
      optional: true,
    },
    'tranType.$': String,
  }).validator(),
  async run({
    branchId,
    currencyId,
    customerId,
    employeeId,
    reportDate,
    tranType,
  }) {
    if (Meteor.isServer) {
      const parentMatch: any = {
        branchId: { $in: branchId },
        tranDate: {
          $gte: reportDate[0],
          $lte: reportDate[1],
        },
      }
      if (tranType.length) parentMatch.tranType = { $in: tranType }
      // Check customer
      if (customerId.length) {
        parentMatch.customerId = { $in: customerId }
      }
      // Check Employee
      if (employeeId.length) {
        parentMatch.employeeId = { $in: employeeId }
      }
      // check currency

      if (currencyId.length) {
        parentMatch.currencyId = { $in: currencyId }
      }

      const data = MoneyTransfer.aggregate([
        {
          $match: parentMatch,
        },
        {
          $addFields: {
            total: {
              $cond: [
                { $eq: ['$tranType', 'In'] },
                { $subtract: ['$amount', '$fee'] },
                { $add: ['$amount', '$fee'] },
              ],
            },
            balanceBroker: {
              $cond: [
                { $eq: ['$tranType', 'In'] },
                { $subtract: ['$amount', '$brokerFee'] },
                { $add: ['$amount', '$brokerFee'] },
              ],
            },
          },
        },
        {
          $addFields: {
            netIncome: {
              $cond: [
                { $eq: ['$tranType', 'In'] },
                { $subtract: ['$balanceBroker', '$total'] },
                { $subtract: ['$total', '$balanceBroker'] },
              ],
            },
          },
        },
        {
          $lookup: {
            from: 'ex_customers',
            localField: 'customerId',
            foreignField: '_id',
            as: 'cusDoc',
          },
        },
        { $unwind: { path: '$cusDoc', preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: 'app_employees',
            localField: 'employeeId',
            foreignField: '_id',
            as: 'empDoc',
          },
        },
        { $unwind: { path: '$empDoc', preserveNullAndEmptyArrays: true } },
        {
          $sort: { tranDate: 1 },
        },
        {
          $group: {
            _id: { currencyId: '$currencyId', type: '$tranType' },
            details: {
              $push: {
                refNo: '$refNo',
                tranDate: '$tranDate',
                customerName: '$cusDoc.name',
                employeeName: '$empDoc.name',
                amount: '$amount',
                fee: '$fee',
                brokerFee: '$brokerFee',
                total: '$total',
                balanceBroker: '$balanceBroker',
                netIncome: '$netIncome',
                branchId: '$branchId',
              },
            },
            totalAmount: { $sum: '$amount' },
            totalFee: { $sum: '$fee' },
            totalBrokerFee: { $sum: '$brokerFee' },
            total: { $sum: '$total' },
            totalBalanceBroker: { $sum: '$balanceBroker' },
            totalNetIncome: { $sum: '$netIncome' },
          },
        },
        {
          $lookup: {
            from: 'ex_exchangeCurrency',
            localField: '_id.currencyId',
            foreignField: '_id',
            as: 'currDoc',
          },
        },
        { $unwind: { path: '$currDoc', preserveNullAndEmptyArrays: true } },
        {
          $group: {
            _id: '$_id.type',
            details: {
              $push: {
                currencyName: '$currDoc.name',
                details: '$details',
                totalAmount: '$totalAmount',
                totalFee: '$totalFee',
                total: '$total',
                totalBrokerFee: '$totalBrokerFee',
                totalBalanceBroker: '$totalBalanceBroker',
                totalNetIncome: '$totalNetIncome',
              },
            },
          },
        },
        {
          $project: {
            groupName: '$_id',
            details: 1,
          },
        },
      ])

      return data
    }
  },
})
rateLimit({
  methods: [],
})
