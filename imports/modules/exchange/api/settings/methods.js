import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { CallPromiseMixin } from 'meteor/didericis:callpromise-mixin'
import SimpleSchema from 'simpl-schema'

import throwError from '/imports/api/lib/throwError'
import rateLimit from '/imports/api/lib/rate-limit'

import Settings from './settings'

// Find
export const fetchSettings = new ValidatedMethod({
  name: 'ex.fetchSettings',
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
      let sort = { _id: 1 }

      return await Settings.find(selector).sort(sort).lean()
    }
  },
})
// Find one
export const findSettingById = new ValidatedMethod({
  name: 'ex.findSettingById',
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
        let setDoc = await Settings.findOne(selector).lean()
        return setDoc
      } catch (err) {
        console.log('Error', err)
        throwError('Find Setting by id error', err)
      }
    }
  },
})

// Insert
export const insertSetting = new ValidatedMethod({
  name: 'ex.insertSetting',
  mixins: [CallPromiseMixin],
  validate: new SimpleSchema({
    customerId: {
      type: String,
      optional: true,
    },
    employeeId: {
      type: String,
      optional: true,
    },
    providerId: {
      type: String,
      optional: true,
    },
    tranTypeId: {
      type: String,
      optional: true,
    },
    branchId: String,
  }).validator(),
  async run(doc) {
    if (Meteor.isServer) {
      try {
        let proDoc = new Settings(doc)
        let res = await proDoc.save()
        return res
      } catch (err) {
        console.log('Error', err)
        throwError('Insert setting error', err)
      }
    }
  },
})

// Update
export const updateSetting = new ValidatedMethod({
  name: 'ex.updateSetting',
  mixins: [CallPromiseMixin],
  validate: new SimpleSchema({
    _id: String,
    customerId: {
      type: String,
      optional: true,
    },
    employeeId: {
      type: String,
      optional: true,
    },
    providerId: {
      type: String,
      optional: true,
    },
    tranTypeId: {
      type: String,
      optional: true,
    },
    currencyId: {
      type: String,
      optional: true,
    },
    branchId: String,
  }).validator(),
  async run(doc) {
    if (Meteor.isServer) {
      return Settings.updateOne({ _id: doc._id }, { $set: doc })
    }
  },
})

// remove
export const removeSettingById = new ValidatedMethod({
  name: 'ex.removeSettingById',
  mixins: [CallPromiseMixin],
  validate: new SimpleSchema({
    _id: String,
  }).validator(),
  async run(_id) {
    if (Meteor.isServer) {
      try {
        return await Settings.deleteOne({ _id })
      } catch (err) {
        console.log('Error', err)
        throwError('Remove Settings error', err)
      }
    }
  },
})

rateLimit({
  methods: [findSettingById, insertSetting, updateSetting, removeSettingById],
})
