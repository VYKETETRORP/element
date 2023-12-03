import { Meteor } from 'meteor/meteor'

import Posts from '../../api/posts/Posts'

Meteor.startup(() => {
  // Posts._ensureIndex({ postDate: 1 })
  // Posts._ensureIndex({ postDate: 1, branchId: 1 }) // Compound Index
})
