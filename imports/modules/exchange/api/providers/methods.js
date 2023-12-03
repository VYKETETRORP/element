import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { CallPromiseMixin } from 'meteor/didericis:callpromise-mixin'
import SimpleSchema from 'simpl-schema'

import throwError from '/imports/api/lib/throwError'
import rateLimit from '/imports/api/lib/rate-limit'

import Providers from './providers'

// Find
export const fetchProviders = new ValidatedMethod({
  name: 'ex.fetchProviders',
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
      let sort = { name: 1 }

      return await Providers.find(selector).sort(sort).lean()
    }
  },
})

// Find One
export const findProviderById = new ValidatedMethod({
  name: 'ex.findProviderById',
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
  run({ selector, options }) {
    if (Meteor.isServer) {
      selector = selector || {}
      options = options || {}
      return Providers.findOne(selector, options)
    }
  },
})

// Insert
export const insertProvider = new ValidatedMethod({
  name: 'ex.insertProvider',
  mixins: [CallPromiseMixin],
  validate: new SimpleSchema({
    name: String,
    memo: {
      type: String,
      optional: true,
    },
    branchId: String,
  }).validator(),
  async run(doc) {
    if (Meteor.isServer) {
      try {
        let proDoc = new Providers(doc)
        let res = await proDoc.save()
        return res
      } catch (err) {
        console.log('Error', err)
        throwError('Insert Provider error', err)
      }
    }
  },
})

// Update
export const updateProvider = new ValidatedMethod({
  name: 'ex.updateProvider',
  mixins: [CallPromiseMixin],
  validate: new SimpleSchema({
    _id: String,
    name: String,
    memo: {
      type: String,
      optional: true,
    },
    branchId: String,
  }).validator(),
  async run(doc) {
    if (Meteor.isServer) {
      return Providers.updateOne({ _id: doc._id }, { $set: doc })
    }
  },
})

// remove
export const removeProviderById = new ValidatedMethod({
  name: 'ex.removeProviderById',
  mixins: [CallPromiseMixin],
  validate: new SimpleSchema({
    _id: String,
  }).validator(),
  async run(_id) {
    if (Meteor.isServer) {
      try {
        return await Providers.deleteOne({ _id })
      } catch (err) {
        console.log('Error', err)
        throwError('Remove Provider error', err)
      }
    }
  },
})

rateLimit({
  methods: [
    findProviderById,
    insertProvider,
    updateProvider,
    removeProviderById,
  ],
})
