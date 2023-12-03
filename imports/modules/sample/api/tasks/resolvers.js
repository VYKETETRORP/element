import Tasks from './tasks'
import Assignees from '../assignees/assignees'

export default {
  Query: {
    sample_getTasks: (_, args, ctx) => {
      return Tasks.find().fetch()
    },
    sample_getTask: (_, { _id }, ctx) => {
      return Tasks.findOne({ _id })
    },
  },

  Mutation: {
    sample_addTask: (_, { input }, ctx) => {
      const result = Tasks.insert(input)
      return result
    },
    sample_updateTask: (_, { _id, input }, ctx) => {
      const result = Tasks.insert({ _id }, { $set: input })
      return result
    },
    sample_removeTask: (_, args, ctx) => {
      const result = Tasks.remove({ _id: args._id })
      return result
    },
  },

  Sample_Task: {
    assignee(parent, args, ctx) {
      return Assignees.findOne({ _id: parent.assigneeId })
    },
  },
}
