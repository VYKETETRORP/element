import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { CallPromiseMixin } from 'meteor/didericis:callpromise-mixin'
import SimpleSchema from 'simpl-schema'
import _ from 'lodash'
import moment from 'moment'

import rateLimit from '/imports/api/lib/rate-limit'

import Posts from '../posts/Posts'
import PostsView from '../views/Posts'

export const reportPost = new ValidatedMethod({
  name: 'sample.reportPost',
  mixins: [CallPromiseMixin],
  validate: new SimpleSchema({
    categoryId: String,
    reportDate: Array,
    'reportDate.$': Date,
  }).validator(),
  async run(params) {
    if (Meteor.isServer) {
      const dateF = moment(params.reportDate[0])
        .startOf('day')
        .toDate()
      const dateT = moment(params.reportDate[1])
        .endOf('day')
        .toDate()

      // Pick query
      let filter = {
        postDate: {
          $gte: dateF,
          $lte: dateT,
        },
      }
      if (params.categoryId) {
        filter.categoryId = params.categoryId
      }

      /** Collection */
      // const data = await Posts.rawCollection()
      //   .aggregate([
      //     {
      //       $match: filter,
      //     },
      //     {
      //       $sort: { postDate: 1 },
      //     },
      //   ])
      //   .toArray()

      /** View */
      // const data = PostsView.find(filter, { sort: { postDate: 1 } }).fetch()
      const data = await PostsView.rawCollection()
        .aggregate([
          {
            $match: filter,
          },
          {
            $sort: { postDate: 1 },
          },
        ])
        .toArray()
      // const data = PostsView.aggregate([
      //   {
      //     $match: filter,
      //   },
      //   {
      //     $sort: { postDate: 1 },
      //   },
      // ])

      return data
    }
  },
})

rateLimit({
  methods: [reportPost],
})
