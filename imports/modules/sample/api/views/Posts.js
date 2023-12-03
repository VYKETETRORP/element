import { Meteor } from 'meteor/meteor'
import { Mongo } from 'meteor/mongo'

const PostsView = new Mongo.Collection('sample_postsView')
export default PostsView

if (Meteor.isServer) {
  const db = PostsView.rawDatabase()

  // Always drop existing before create new
  db.dropCollection('sample_postsView', (err, res) => {
    // Don't check err, it will auto update
    db.createCollection('sample_postsView', {
      viewOn: 'sample_posts',
      pipeline: [
        {
          $lookup: {
            from: 'sample_categories',
            localField: 'categoryId',
            foreignField: '_id',
            as: 'categoryDoc',
          },
        },
        { $unwind: '$categoryDoc' },
        // {
        //   $project: {
        //     posDate: 1,
        //     title: 1,
        //     body: 1,
        //   },
        // },
      ],
    })
  })
}
