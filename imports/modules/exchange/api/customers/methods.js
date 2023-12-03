import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { CallPromiseMixin } from 'meteor/didericis:callpromise-mixin'
import SimpleSchema from 'simpl-schema'

import throwError from '/imports/api/lib/throwError'
import rateLimit from '/imports/api/lib/rate-limit'

import Customers from '../customers/customers'
// lookup
export const lookupCustomer = new ValidatedMethod({
  name: 'ex.lookupCustomer',
  mixins: [CallPromiseMixin],
  validate: new SimpleSchema({
    selector: {
      type: Object,
      optional: true,
      blackbox: true,
    },
  }).validator(),
  run({ selector }) {
    if (Meteor.isServer) {
      // Meteor._sleepForMs(100)
      // if (!selector.status) selector.status = 'Active'
      selector = selector || {}
      let opts = Customers.aggregate([
        {
          $match: selector,
        },
        { $sort: { name: 1 } },

        {
          $project: {
            tel: {
              $cond: {
                if: { $ne: [{ $ifNull: ['$telephone', ''] }, ''] },
                then: { $concat: [' | Tel: ', '$telephone'] },
                else: '',
              },
            },
            addr: {
              $cond: {
                if: { $ne: [{ $ifNull: ['$address', ''] }, ''] },
                then: { $concat: [' | Addr: ', '$address'] },
                else: '',
              },
            },

            label: '$name',
            value: '$_id',
            doc: '$$ROOT',
          },
        },
        {
          $project: {
            label: {
              $concat: ['$label', '$tel', '$addr'],
            },
            value: 1,
            doc: 1,
          },
        },
        { $limit: 100 },
      ])
      return opts
    }
  },
})
// Find
export const fetchCustomers = new ValidatedMethod({
  name: 'ex.fetchCustomers',
  mixins: [CallPromiseMixin],
  validate: new SimpleSchema({
    selector: {
      type: Object,
      optional: true,
      blackbox: true,
    },
    page: Number,
    pageSize: Number,
    sort: {
      type: Object,
      optional: true,
      blackbox: true,
    },
  }).validator(),
  async run({ selector, sort, page, pageSize }) {
    if (Meteor.isServer) {
      try {
        selector = selector || {}
        sort = sort || { name: 1 }

        let limit = pageSize
        let skip = (page - 1) * pageSize

        let data = await Customers.find(selector)
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .lean()

        let total = await Customers.find(selector).countDocuments()

        return { data, total: total || 0 }
      } catch (err) {
        console.log('Error', err)
        throwError('Find customer by id error', err)
      }
    }
  },
})
export const findCustomers = new ValidatedMethod({
  name: 'ex.findCustomers',
  mixins: [CallPromiseMixin],
  validate: new SimpleSchema({
    selector: {
      type: Object,
      optional: true,
      blackbox: true,
    },
  }).validator(),
  async run({ selector }) {
    if (Meteor.isServer) {
      try {
        selector = selector || {}
        let sort = { name: 1 }
        let limit = 50
        return await Customers.find(selector).sort(sort).lean().limit(limit)
      } catch (err) {
        console.log('Error', err)
        throwError('Find customer error', err)
      }
    }
  },
})
// Find one
export const findCustomerById = new ValidatedMethod({
  name: 'ex.findCustomerById',
  mixins: [CallPromiseMixin],
  validate: new SimpleSchema({
    _id: String,
  }).validator(),
  async run(_id) {
    if (Meteor.isServer) {
      try {
        let cusDoc = await Customers.findOne({ _id }).lean()

        if (!cusDoc) throw `This transaction deleted!`
        delete cusDoc.__v
        return cusDoc
      } catch (err) {
        console.log('Error', err)
        throwError('Find customer by id error', err)
      }
    }
  },
})

// Insert
export const insertCustomer = new ValidatedMethod({
  name: 'ex.insertCustomer',
  mixins: [CallPromiseMixin],
  validate: new SimpleSchema({
    name: String,
    telephone: {
      type: String,
      optional: true,
    },
    address: {
      type: String,
      optional: true,
    },
    branchId: String,
  }).validator(),
  async run(doc) {
    if (Meteor.isServer) {
      try {
        let cusDoc = new Customers(doc)
        let res = await cusDoc.save()
        return res
      } catch (err) {
        console.log('Error', err)
        throwError('Insert customer error', err)
      }
    }
  },
})

// Update
export const updateCustomer = new ValidatedMethod({
  name: 'ex.updateCustomer',
  mixins: [CallPromiseMixin],
  validate: new SimpleSchema({
    _id: String,
    name: String,
    telephone: {
      type: String,
      optional: true,
    },
    address: {
      type: String,
      optional: true,
    },
    branchId: String,
  }).validator(),
  async run(doc) {
    if (Meteor.isServer) {
      try {
        let cusDoc = await Customers.findOne({ _id: doc._id })
        if (!cusDoc) throw `This transaction deleted!`

        let res = await Customers.updateOne({ _id: doc._id }, { $set: doc })

        return res
      } catch (err) {
        console.log('Error', err)
        throwError('Update customer error', err)
      }
    }
  },
})

// Update
export const removeCustomerById = new ValidatedMethod({
  name: 'ex.removeCustomerById',
  mixins: [CallPromiseMixin],
  validate: new SimpleSchema({
    _id: String,
  }).validator(),
  async run(_id) {
    if (Meteor.isServer) {
      try {
        return await Customers.deleteOne({ _id })
      } catch (err) {
        console.log('Error', err)
        throwError('Remove customer error', err)
      }
    }
  },
})

rateLimit({
  methods: [
    findCustomerById,
    findCustomers,
    insertCustomer,
    updateCustomer,
    removeCustomerById,
  ],
})
