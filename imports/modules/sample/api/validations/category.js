import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { CallPromiseMixin } from 'meteor/didericis:callpromise-mixin'
import SimpleSchema from 'simpl-schema'

import rateLimit from '/imports/api/lib/rate-limit'

// Collection
import Categories from '../categories/Categories'

// Category exist
export const validateCategoryExist = new ValidatedMethod({
  name: 'sample.validateCategoryExist',
  mixins: [CallPromiseMixin],
  validate: new SimpleSchema({
    selector: {
      type: Object,
      blackbox: true,
      optional: true,
    },
  }).validator(),
  run({ selector }) {
    if (Meteor.isServer) {
      return Categories.findOne(selector)
    }
  },
})

rateLimit({
  methods: [],
})
