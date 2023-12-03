import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { CallPromiseMixin } from 'meteor/didericis:callpromise-mixin'
import SimpleSchema from 'simpl-schema'
import _ from 'lodash'
import moment from 'moment'

import throwError from '/imports/api/lib/throwError'
import rateLimit from '/imports/api/lib/rate-limit'

import Posts from './Posts'

// Data table
export const dataTablePosts = new ValidatedMethod({
  name: 'sample.dataTablePosts',
  mixins: [CallPromiseMixin],
  validate: new SimpleSchema({
    tableQuery: {
      type: Object,
      blackbox: true,
    },
    params: {
      type: Object,
      blackbox: true,
      optional: true,
    },
  }).validator(),
  run({ tableQuery, params }) {
    if (Meteor.isServer) {
      tableQuery = tableQuery || {}
      params = params || {}

      // Selector
      const selector = {}
      if (params.date) {
        selector.postDate = {
          $gte: moment(params.date[0])
            .startOf('day')
            .toDate(),
          $lte: moment(params.date[1])
            .endOf('day')
            .toDate(),
        }
      }

      // Options
      const skip = (tableQuery.page - 1) * tableQuery.pageSize
      const limit = tableQuery.pageSize
      const sort = {
        [tableQuery.sortInfo.prop]:
          tableQuery.sortInfo.order === 'ascending' ? 1 : -1,
      }
      const options = { sort, skip, limit }

      let data = Posts.find(selector, options).fetch()
      let total = Posts.find(selector).count()

      return { data, total }
    }
  },
})

// Find
export const findPosts = new ValidatedMethod({
  name: 'sample.findPosts',
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

      return Posts.find(selector, options).fetch()
    }
  },
})

// Find One
export const findOnePost = new ValidatedMethod({
  name: 'sample.findOnePost',
  mixins: [CallPromiseMixin],
  validate: new SimpleSchema({
    _id: String,
  }).validator(),
  run({ _id }) {
    if (Meteor.isServer) {
      return Posts.findOne({ _id })
    }
  },
})

// Insert
export const insertPost = new ValidatedMethod({
  name: 'sample.insertPost',
  mixins: [CallPromiseMixin],
  validate: Posts.schema.validator(),
  run(doc) {
    if (Meteor.isServer) {
      try {
        return Posts.insert(doc)
      } catch (error) {
        throwError('Post Insert', error, doc)
      }
    }
  },
})

// Update
export const updatePost = new ValidatedMethod({
  name: 'sample.updatePost',
  mixins: [CallPromiseMixin],
  validate: _.clone(Posts.schema)
    .extend({
      _id: String,
    })
    .validator(),
  run(doc) {
    if (Meteor.isServer) {
      return Posts.update({ _id: doc._id }, { $set: doc })
    }
  },
})

// Upsert Category
export const upsertPost = new ValidatedMethod({
  name: 'sample.upsertPost',
  mixins: [CallPromiseMixin],
  validate: _.clone(Posts.schema)
    .extend({
      _id: {
        type: String,
        optional: true,
      },
    })
    .validator(),
  run(doc) {
    if (Meteor.isServer) {
      let _id
      if (!doc._id) {
        _id = getNextSeq({
          _id: `blog_post${doc.branchId}`,
          opts: { seq: 1 },
        })
        doc._id = _id
      }
      try {
        return Posts.upsert({ _id: doc._id }, { $set: doc })
      } catch (error) {
        if (_id) {
          _id = getNextSeq({
            _id: `blog_post${doc.branchId}`,
            seq: { seq: -1 },
          })
        }
        throwError('Post Upsert', error, doc)
      }
    }
  },
})

// Soft remove
export const softRemovePost = new ValidatedMethod({
  name: 'sample.softRemovePost',
  mixins: [CallPromiseMixin],
  // validate: null,
  validate: new SimpleSchema({
    _id: String,
  }).validator(),
  run({ _id }) {
    if (Meteor.isServer) {
      return Posts.softRemove(_id)
    }
  },
})

// Restore
export const restorePost = new ValidatedMethod({
  name: 'sample.restorePost',
  mixins: [CallPromiseMixin],
  validate: new SimpleSchema({
    _id: String,
  }).validator(),
  run({ _id }) {
    if (Meteor.isServer) {
      return Posts.restore(_id)
    }
  },
})

// Remove
export const removePost = new ValidatedMethod({
  name: 'sample.removePost',
  mixins: [CallPromiseMixin],
  validate: new SimpleSchema({
    _id: String,
  }).validator(),
  run({ _id }) {
    if (Meteor.isServer) {
      return Posts.remove(_id)
    }
  },
})

rateLimit({
  methods: [
    findPosts,
    findOnePost,
    insertPost,
    updatePost,
    softRemovePost,
    restorePost,
    removePost,
  ],
})
