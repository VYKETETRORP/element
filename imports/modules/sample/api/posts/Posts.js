import { Mongo } from 'meteor/mongo'
import SimpleSchema from 'simpl-schema'

const Posts = new Mongo.Collection('sample_posts')
Posts.schema = new SimpleSchema({
  postDate: {
    type: Date,
    index: 1, // Or could set in `/startup/ensure-index.js`
  },
  categoryId: {
    type: String,
    index: 1, // Or could set in `/startup/ensure-index.js`
  },
  title: {
    type: String,
  },
  body: {
    type: String,
  },
  status: {
    type: String,
  },
  memo: {
    type: String,
    optional: true,
  },
  branchId: {
    type: String,
    index: 1, // Or could set in `/startup/ensure-index.js`
  },
})

Posts.attachSchema(Posts.schema)

export default Posts
