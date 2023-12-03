import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { CallPromiseMixin } from 'meteor/didericis:callpromise-mixin'
import SimpleSchema from 'simpl-schema'
import _ from 'lodash'
import throwError from '/imports/api/lib/throwError'
import rateLimit from '/imports/api/lib/rate-limit'
import Categories from './Categories'

type Category = {
  refNo: string
  name: string
  memo: string
}

// Find
export const findCategories = new ValidatedMethod<
  {
    selector: { [k: string]: any }
    options?: { [k: string]: any }
  },
  Category[]
>({
  name: 'sample.findCategories',
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
    if (!Meteor.isServer) return []

    selector = selector || {}
    options = options || {}
    return Categories.find(selector, options).fetch()
  },
})

// Find One
export const findOneCategory = new ValidatedMethod({
  name: 'sample.findOneCategory',
  mixins: [CallPromiseMixin],
  validate: new SimpleSchema({
    _id: String,
  }).validator(),
  run({ _id }) {
    if (Meteor.isServer) {
      return Categories.findOne({ _id })
    }
  },
})

// Insert
export const insertCategory = new ValidatedMethod({
  name: 'sample.insertCategory',
  mixins: [CallPromiseMixin],
  validate: Categories.schema.validator(),
  run(doc) {
    if (Meteor.isServer) {
      try {
        return Categories.insert(doc)
      } catch (error) {
        throwError('Category Insert', error, doc)
      }
    }
  },
})

// Update
export const updateCategory = new ValidatedMethod({
  name: 'sample.updateCategory',
  mixins: [CallPromiseMixin],
  validate: _.clone(Categories.schema)
    .extend({
      _id: String,
    })
    .validator(),
  run(doc) {
    if (Meteor.isServer) {
      return Categories.update({ _id: doc._id }, { $set: doc })
    }
  },
})

// Remove
export const removeCategory = new ValidatedMethod({
  name: 'sample.removeCategory',
  mixins: [CallPromiseMixin],
  validate: new SimpleSchema({
    _id: String,
  }).validator(),
  run({ _id }) {
    if (Meteor.isServer) {
      return Categories.remove(_id)
    }
  },
})

rateLimit({
  methods: [
    findCategories,
    findOneCategory,
    insertCategory,
    updateCategory,
    removeCategory,
  ],
})
