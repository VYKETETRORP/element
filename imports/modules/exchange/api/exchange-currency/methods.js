import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { CallPromiseMixin } from 'meteor/didericis:callpromise-mixin'
import SimpleSchema from 'simpl-schema'

import throwError from '/imports/api/lib/throwError'
import rateLimit from '/imports/api/lib/rate-limit'

import ExchangeCurrency from './exchange-currency'
// get Exchange Rate
export const getExchangeRateOperator = new ValidatedMethod({
  name: 'ex.getExchangeRateOperator',
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
      let data = await ExchangeCurrency.aggregate([
        {
          $match: selector,
        },
        { $match: { base: true } },
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
            from: 'ex_exchangeRateDetails',
            localField: '_id',
            foreignField: 'exchangeCurrencyId',
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
          $sort: { 'exchangeRateDoc.tranDate': 1 },
        },
        {
          $group: {
            _id: '$_id',
            exchangeDetailRateId: { $last: '$exchangeRateDetailDoc._id' },
            name: { $last: '$name' },
            operator: { $last: '$operator' },
            symbol: { $last: '$symbol' },
            format: { $last: '$format' },
            rate: { $last: '$exchangeRateDetailDoc.rate' },
            tranDate: { $last: '$exchangeRateDoc.tranDate' },
          },
        },
        {
          $addFields: {
            rate: {
              $toDouble: '$rate',
            },
          },
        },
        // {
        //   $project:{
        //     name:{ $concat: [ "$currencyName", " - (", "$rate",")" ] },
        //     exchangeRateId:1,
        //     currencyName:1,
        //     operator:{$last:1,
        //     rate:1,
        //     tranDate:1
        //   }
        // },

        {
          $sort: { name: 1 },
        },
      ]).allowDiskUse(true)
      return data
    }
  },
})
// Find
export const fetchExchangeCurrency = new ValidatedMethod({
  name: 'ex.fetchExchangeCurrency',
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
      const sort = { order: 1 }

      return await ExchangeCurrency.find(selector)

        .sort(sort)
        .lean()
    }
  },
})

// Find One
export const findExchangeCurrencyById = new ValidatedMethod({
  name: 'ex.findExchangeCurrencyById',
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
  async run({ selector, options }) {
    if (Meteor.isServer) {
      selector = selector || {}
      options = options || {}

      return ExchangeCurrency.findOne(selector, options).lean()
    }
  },
})

// Insert
export const insertExchangeCurrency = new ValidatedMethod({
  name: 'ex.insertExchangeCurrency',
  mixins: [CallPromiseMixin],
  validate: new SimpleSchema({
    name: String,
    symbol: String,
    // fromSymbol:String,
    // operator: String,
    // toSymbol:String,
    base: Boolean,
    order: Number,
    branchId: String,
  }).validator(),
  async run(doc) {
    if (Meteor.isServer) {
      try {
        let currencyDoc = new ExchangeCurrency(doc)
        let res = await currencyDoc.save()
        return res
      } catch (err) {
        console.log('Error', err)
        throwError('Insert Exchange Currency error', err)
      }
    }
  },
})

// Update
export const updateExchangeCurrency = new ValidatedMethod({
  name: 'ex.updateExchangeCurrency',
  mixins: [CallPromiseMixin],
  validate: new SimpleSchema({
    _id: String,
    name: String,
    symbol: String,
    // fromSymbol: String,
    // operator: String,
    // toSymbol: String,
    base: Boolean,
    order: Number,
    branchId: String,
  }).validator(),
  async run(doc) {
    if (Meteor.isServer) {
      return await ExchangeCurrency.updateOne({ _id: doc._id }, { $set: doc })
    }
  },
})

// remove
export const removeExchangeCurrencyById = new ValidatedMethod({
  name: 'ex.removeExchangeCurrencyById',
  mixins: [CallPromiseMixin],
  validate: new SimpleSchema({
    _id: String,
  }).validator(),
  async run(_id) {
    if (Meteor.isServer) {
      try {
        return await ExchangeCurrency.deleteOne({ _id })
      } catch (err) {
        console.log('Error', err)
        throwError('Remove Exchange Currency error', err)
      }
    }
  },
})

rateLimit({
  methods: [
    findExchangeCurrencyById,
    insertExchangeCurrency,
    updateExchangeCurrency,
    removeExchangeCurrencyById,
  ],
})
