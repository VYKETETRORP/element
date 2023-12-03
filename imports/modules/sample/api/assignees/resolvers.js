import Assignees from './assignees'
import Tasks from '../tasks/tasks'

export default {
  Query: {
    sample_getAssignees: (_, args, ctx) => {
      return Assignees.find().fetch()
    },
    sample_getAssignee: (_, { _id }, ctx) => {
      return Assignees.findOne({ _id })
    },
  },

  Mutation: {
    sample_addAssignee: (_, { input }, ctx) => {
      const result = Assignees.insert(input)
      return result
    },
    sample_updateAssignee: (_, { _id, input }, ctx) => {
      const result = Assignees.update({ _id }, { $set: input })
      return result
    },
    sample_removeAssignee: (_, { _id }, ctx) => {
      const result = Assignees.remove({ _id })
      return result
    },
  },

  Sample_Assignee: {
    tasks(parent, args, ctx) {
      return Tasks.find({ assigneeId: parent._id }).fetch()
    },
  },
}
