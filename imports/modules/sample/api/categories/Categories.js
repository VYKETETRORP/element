import { Meteor } from 'meteor/meteor'
import { Mongo } from 'meteor/mongo'
import SimpleSchema from 'simpl-schema'

const Categories = new Mongo.Collection('sample_categories')

Categories.schema = new SimpleSchema({
  refNo: {
    type: String,
    unique: true,
  },
  name: {
    type: String,
    unique: true,
  },
  memo: {
    type: String,
    optional: true,
  },
})

Categories.attachSchema(Categories.schema)

export default Categories
