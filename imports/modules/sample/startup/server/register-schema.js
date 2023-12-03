import assigneeTypeDefs from '../../api/assignees/schema.graphql'
import assigneeResolvers from '../../api/assignees/resolvers'
import taskTypeDefs from '../../api/tasks/schema.graphql'
import taskResolvers from '../../api/tasks/resolvers'

export const typeDefs = [
  assigneeTypeDefs,
  taskTypeDefs,
  // other
]

export const resolvers = [
  assigneeResolvers,
  taskResolvers,
  // ...other
]
