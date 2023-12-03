import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { CallPromiseMixin } from 'meteor/didericis:callpromise-mixin'
import SimpleSchema from 'simpl-schema'

import TranTypes from './transaction-type'
import Transaction from '../transaction/transaction'

export const fetchTranTypes = new ValidatedMethod({
  name: 'ex.fetchTranTypes',
  mixins: [CallPromiseMixin],
  validate: new SimpleSchema({
    selector: {
      type: Object,
      optional: true,
      blackbox: true,
    },
    sort: {
      type: Object,
      optional: true,
      blackbox: true,
    },
  }).validator(),
  async run({ selector, sort }) {
    if (Meteor.isServer) {
      try {
        selector = selector || {}
        sort = sort || { name: 1 }

        let data = await TranTypes.find(selector).sort(sort).lean()

        return data
      } catch (err) {
        throw new Meteor.Error('transaction type error', err)
      }
    }
  },
})

export const checkTranTypeExist = new ValidatedMethod({
  name: 'ex.checkTranTypeExist',
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
      try {
        let data = await TranTypes.findOne(selector).lean()

        return data
      } catch (err) {
        throw new Meteor.Error('Find transaction type by id error', err)
      }
    }
  },
})
export const findTranTypeById = new ValidatedMethod({
  name: 'ex.findTranTypeById',
  mixins: [CallPromiseMixin],
  validate: new SimpleSchema({
    id: String,
  }).validator(),
  async run({ id }) {
    if (Meteor.isServer) {
      try {
        let data = await TranTypes.findOne({ _id: id }).lean()

        return data
      } catch (err) {
        throw new Meteor.Error('Find transaction type by id error', err)
      }
    }
  },
})

export const insertTranType = new ValidatedMethod({
  name: 'ex.insertTranType',
  mixins: [CallPromiseMixin],
  validate: new SimpleSchema({
    doc: Object,
    'doc.name': String,
  }).validator(),
  async run({ doc }) {
    if (Meteor.isServer) {
      try {
        const col = await TranTypes(doc)
        const res = await col.save()

        return res.id
      } catch (err) {
        throw new Meteor.Error('Insert transaction type error', err)
      }
    }
  },
})

export const updateTranType = new ValidatedMethod({
  name: 'ex.updateTranType',
  mixins: [CallPromiseMixin],
  validate: new SimpleSchema({
    doc: Object,
    'doc._id': String,
    'doc.name': String,
  }).validator(),
  async run({ doc }) {
    if (Meteor.isServer) {
      try {
        const res = await TranTypes.updateOne({ _id: doc._id }, { $set: doc })

        return res
      } catch (err) {
        throw new Meteor.Error('Update transaction type error', err)
      }
    }
  },
})

export const removeTranTypeById = new ValidatedMethod({
  name: 'ex.removeTranTypeById',
  mixins: [CallPromiseMixin],
  validate: new SimpleSchema({
    id: String,
  }).validator(),
  async run({ id }) {
    if (Meteor.isServer) {
      try {
        const exist = await Transaction.findOne({ categoryId: id }).lean()
        if (exist) throw 'This record used.'

        const res = await TranTypes.deleteOne({ _id: id })

        return res
      } catch (err) {
        throw new Meteor.Error('Remove transaction type error', err)
      }
    }
  },
})
