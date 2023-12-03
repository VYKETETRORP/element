import { Meteor } from 'meteor/meteor'

import Employees from '../../api/employees/employees'
import Journals from '../../api/journals/journals'
import JournalDetails from '../../api/journals/journal-details'

Meteor.startup(() => {
  // Employees._ensureIndex({ code: 1, branchId: 1 }, { unique: true })

  // Journals._ensureIndex({ tranDate: 1 })
  // Journals._ensureIndex({ journalType: 1 })
  // Journals._ensureIndex({ branchId: 1 })
  // JournalDetails._ensureIndex({ journalId: 1 })
  // JournalDetails._ensureIndex({ chartAccountId: 1 })
  // JournalDetails._ensureIndex({ nameId: 1 })
  // JournalDetails._ensureIndex({ classId: 1 })
  // JournalDetails._ensureIndex({ branchId: 1 })
})
